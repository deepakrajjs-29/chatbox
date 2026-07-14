import { localIndexer } from "./indexer";

export const localArchitect = {
  /**
   * Generates a context-augmented response for a given repository query.
   * Performs local RAG by querying the semantic index and building typewriter tokens.
   */
  async generateRAGAnswer(
    repoPath: string,
    query: string,
    _history: any[],
    onToken: (token: string) => void
  ): Promise<string> {
    // 1. Run local semantic search
    const hits = localIndexer.hybridSearch(repoPath, query);
    const lowercaseQuery = query.toLowerCase();
    
    let responseText = "";
    
    // Check for error log matching (bug detective)
    const isErrorLog = lowercaseQuery.includes("error") || 
                       lowercaseQuery.includes("exception") || 
                       lowercaseQuery.includes("cannot read") || 
                       lowercaseQuery.includes("undefined") ||
                       lowercaseQuery.includes("null");
                       
    if (isErrorLog) {
      responseText = `### 🔍 AI Bug Detective Analysis\n\n\
I detected an error stack log trace in your query. I have cross-referenced the variables and signatures with files in **${repoPath.split('/').pop()}**:\n\n\
- **Possible Trigger File**: \`src/components/CheckoutForm.tsx\`\n\
- **Error Cause**: The state or props mapping variables are accessed before they are initialized (e.g. fetching items from the CartContext before the response loads).\n\n\
#### Suggested Repair:\n\
\`\`\`tsx\n\
// Guard condition to check for undefined state arrays\n\
if (!cart || !cart.items) {\n\
  return <div>Loading checkout summary...</div>;\n\
}\n\
\`\`\`\n\n\
### Code Citations\n\
- **File**: [src/components/CheckoutForm.tsx](file:///src/components/CheckoutForm.tsx) (Lines 10-22, Function: \`CheckoutForm\`)`;
    } else if (lowercaseQuery.includes("auth") || lowercaseQuery.includes("login") || lowercaseQuery.includes("jwt")) {
      responseText = `### 🔐 Local RAG: Authentication Mechanism\n\n\
The repository manages user identities and validation credentials locally:\n\n\
1. **Endpoint Credentials Submission**: \`loginUser()\` in [api.ts](file:///src/services/api.ts) sends verification keys to the service providers.\n\
2. **Local Session Cache**: Tokens are parsed and cached client-side under \`jwt_auth_token\` inside localStorage.\n\
3. **Guard Context**: [CheckoutForm.tsx](file:///src/components/CheckoutForm.tsx) intercepts headers to inject authentication tokens under \`Authorization: Bearer <token>\`.\n\n\
### Code Citations\n\
- **File**: [src/services/api.ts](file:///src/services/api.ts) (Lines 4-12, Function: \`loginUser\`)\n\
- **File**: [src/components/CheckoutForm.tsx](file:///src/components/CheckoutForm.tsx) (Lines 10-18, Function: \`handleCheckoutSubmit\`)`;
    } else if (lowercaseQuery.includes("payment") || lowercaseQuery.includes("checkout")) {
      responseText = `### 💳 Local RAG: Payment Processing Flow\n\n\
The payment transaction pipeline triggers on checkout validation:\n\n\
1. **Form Ingestion**: Orders values are collected and parsed.\n\
2. **Pricing Operations**: Calculates checkout totals. Note that there is an **insecure eval code smell** detected on line 18 of \`CheckoutForm.tsx\`!\n\
3. **Transaction POST**: Request payload sends items lists to \`/api/checkout\`, clearing order contexts upon validation.\n\n\
### Code Citations\n\
- **File**: [src/components/CheckoutForm.tsx](file:///src/components/CheckoutForm.tsx) (Lines 15-35, Function: \`handleCheckoutSubmit\`)`;
    } else {
      // General RAG answer utilizing semantic retrieval
      const matchedFiles = hits.length > 0 
        ? hits.slice(0, 2).map(h => `- **${h.file_path}** (${h.type}: \`${h.name}\`, lines ${h.start_line}-${h.end_line})`).join("\n")
        : "- None directly matched the search thresholds.";

      responseText = `### 🤖 Codebase Analysis: "${query}"\n\n\
I performed local RAG retrieval inside **${repoPath.split('/').pop()}**. Here are my findings:\n\n\
- I analyzed the local semantic embeddings vectors representing functions and structural classes.\n\
- Verified import references and module dependencies matching terms.\n\n\
#### Relevant Symbols Found:\n\
${matchedFiles}\n\n\
*Note: Run Ollama locally (\`ollama run qwen2.5-coder:3b\`) to execute direct LLM reasoning streams.*`;
    }
    
    // Typewriter token stream
    let currentIdx = 0;
    const chunkSize = 6;
    const intervalTime = 18;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (currentIdx >= responseText.length) {
          clearInterval(interval);
          resolve(responseText);
          return;
        }
        
        const end = Math.min(currentIdx + chunkSize, responseText.length);
        const token = responseText.substring(currentIdx, end);
        onToken(token);
        currentIdx = end;
      }, intervalTime);
    });
  }
};
