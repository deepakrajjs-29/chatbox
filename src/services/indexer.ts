export interface IndexChunk {
  id: string;
  repoPath: string;
  filePath: string;
  language: string;
  chunkType: string; // "function" | "class" | "interface" | "struct" | "markdown" | "general"
  name: string;
  startLine: number;
  endLine: number;
  sourceCode: string;
  embedding: number[];
  metadata: {
    complexityScore: number;
    importance: number;
  };
}

// Client-side text embedder using the hashing trick to generate 384-dimensional normalized vectors
export function getClientEmbedding(text: string): number[] {
  const vector = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  
  for (const word of words) {
    if (word.length < 2) continue;
    
    // Hash word using basic polynomial hash
    let hash1 = 5381;
    let hash2 = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash1 = ((hash1 << 5) + hash1) + char;
      hash2 = hash2 + char;
    }
    
    const idx = Math.abs(hash1) % 384;
    const sign = hash2 % 2 === 0 ? 1 : -1;
    vector[idx] += sign;
  }
  
  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < 384; i++) {
      vector[i] /= norm;
    }
  }
  
  return vector;
}

// Compute cosine similarity between two vectors
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  return dotProduct;
}

// Mock codebase content data matching our projects to run real chunks generation
const FILE_CONTENTS_DB: Record<string, Record<string, string>> = {
  "/projects/react-ecom-client": {
    "src/services/api.ts": `
const API_URL = "http://localhost:8000/api";
const API_SECRET = "sk_live_MOCK_KEY_REPLACE_ME_0000000000";

export async function loginUser(credentials) {
  const response = await fetch(\`\${API_URL}/auth/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  return response.json();
}

export async function fetchProducts() {
  const response = await fetch(\`\${API_URL}/products\`);
  return response.json();
}
    `,
    "src/components/CheckoutForm.tsx": `
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export function CheckoutForm() {
  const { cart, clearCart } = useCart();
  const [address, setAddress] = useState('');
  
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_auth_token');
    
    // Insecure pricing calculation
    const userInputPriceMultiplier = "1.0";
    const totalCost = eval(userInputPriceMultiplier + " * cart.total");
    
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({ address, total: totalCost, items: cart.items })
    });
    
    if (response.ok) {
      clearCart();
      alert('Order charged successfully!');
    }
  };
  
  return (
    <form onSubmit={handleCheckoutSubmit}>
      <input value={address} onChange={e => setAddress(e.target.value)} />
      <button type="submit">Submit Charge</button>
    </form>
  );
}
    `
  },
  "/projects/python-data-engine": {
    "engine/db.py": `
import psycopg2

def get_db_connection():
    return psycopg2.connect("dbname=engine user=postgres password=secret")

def select_active_users(status):
    conn = get_db_connection()
    cursor = conn.cursor()
    # SQL Injection risk
    cursor.execute(f"SELECT * FROM users WHERE status = '{status}'")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return users
    `
  }
};

export const localIndexer = {
  generateSmartChunks(repoPath: string, filePath: string, content: string): IndexChunk[] {
    const chunks: IndexChunk[] = [];
    const lines = content.split('\n');
    let chunkIdCounter = 0;
    
    // Attempt match function/methods block
    const functionRegex = /(export\s+)?(function|class|def|struct|trait|enum)\s+(\w+)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const type = match[2];
      const name = match[3];
      const startPos = match.index;
      
      // Rough estimation of function lines boundaries
      const startLine = content.substring(0, startPos).split('\n').length;
      const endLine = Math.min(startLine + 25, lines.length);
      
      const sourceCode = lines.slice(startLine - 1, endLine).join('\n');
      const embedding = getClientEmbedding(sourceCode);
      
      chunks.push({
        id: `chk_${filePath.replace(/\//g, '_')}_${chunkIdCounter++}`,
        repoPath,
        filePath,
        language: filePath.endsWith('.py') ? 'Python' : filePath.endsWith('.rs') ? 'Rust' : 'TypeScript',
        chunkType: type === 'class' ? 'class' : type === 'struct' ? 'struct' : 'function',
        name,
        startLine,
        endLine,
        sourceCode,
        embedding,
        metadata: {
          complexityScore: name.includes('Parser') || name.includes('Context') ? 78 : 35,
          importance: name.includes('auth') || name.includes('db') ? 8 : 4
        }
      });
    }
    
    // Add fallback whole file chunk if no symbols extracted
    if (chunks.length === 0) {
      chunks.push({
        id: `chk_${filePath.replace(/\//g, '_')}_fallback`,
        repoPath,
        filePath,
        language: filePath.endsWith('.py') ? 'Python' : filePath.endsWith('.rs') ? 'Rust' : 'TypeScript',
        chunkType: 'general',
        name: filePath.split('/').pop() || filePath,
        startLine: 1,
        endLine: lines.length,
        sourceCode: content,
        embedding: getClientEmbedding(content),
        metadata: {
          complexityScore: 25,
          importance: 5
        }
      });
    }
    
    return chunks;
  },

  /**
   * Run semantic index search locally using hybrid rank (semantic similarity + keywords weight)
   */
  hybridSearch(repoPath: string, query: string): any[] {
    const queryVector = getClientEmbedding(query);
    const lowercaseQuery = query.toLowerCase();
    
    // Get mock files content to run real dynamic chunk parses
    const repoFiles = FILE_CONTENTS_DB[repoPath] || FILE_CONTENTS_DB["/projects/react-ecom-client"];
    let allChunks: IndexChunk[] = [];
    
    Object.keys(repoFiles).forEach(filePath => {
      const content = repoFiles[filePath];
      const chunks = this.generateSmartChunks(repoPath, filePath, content);
      allChunks = allChunks.concat(chunks);
    });
    
    // Rank chunks
    const ranked = allChunks.map(chunk => {
      // 1. Semantic Similarity (Cosine Similarity)
      const semanticScore = cosineSimilarity(queryVector, chunk.embedding);
      
      // 2. Keyword Match weighting
      let keywordScore = 0;
      if (chunk.sourceCode.toLowerCase().includes(lowercaseQuery)) {
        keywordScore += 0.2;
      }
      if (chunk.name.toLowerCase().includes(lowercaseQuery)) {
        keywordScore += 0.3;
      }
      
      // 3. Metadata priority weights
      let importanceWeight = chunk.metadata.importance * 0.02; // max +0.20
      
      const similarity_score = Math.min((semanticScore * 0.5) + (keywordScore * 0.3) + importanceWeight, 1.0);
      
      return {
        chunk_id: chunk.id,
        file_path: chunk.filePath,
        similarity_score,
        source_code: chunk.sourceCode,
        start_line: chunk.startLine,
        end_line: chunk.endLine,
        name: chunk.name,
        type: chunk.chunkType,
        language: chunk.language
      };
    });
    
    // Filter and sort
    return ranked
      .filter(item => item.similarity_score > 0.3)
      .sort((a, b) => b.similarity_score - a.similarity_score);
  }
};
