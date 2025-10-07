import { GoogleGenAI, FunctionDeclaration, GenerateContentResponse, Type } from '@google/genai';
import { Product } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchProducts: FunctionDeclaration = {
  name: 'searchProducts',
  description: 'Searches for products based on a query or price range.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search term for products. Can be a product name, category, or description.',
      },
      maxPrice: {
        type: Type.NUMBER,
        description: 'The maximum price for the products to search for.',
      },
    },
    required: [],
  },
};

const addToCart: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Adds a specified quantity of a product to the shopping cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The unique ID of the product to add. For example: "prod_001".',
      },
      quantity: {
        type: Type.INTEGER,
        description: 'The number of units to add to the cart. Defaults to 1 if not specified.',
      },
    },
    required: ['productId', 'quantity'],
  },
};

const getCart: FunctionDeclaration = {
  name: 'getCart',
  description: 'Retrieves the current contents of the shopping cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const checkout: FunctionDeclaration = {
  name: 'checkout',
  description: 'Initiates the checkout process for the items in the cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};


export const runAgentInteraction = async (prompt: string, products: Product[]): Promise<GenerateContentResponse> => {
    const productList = products.map(p => `ID: ${p.id}, Name: ${p.name}, Price: $${p.price}`).join('\n');
    
    const systemInstruction = `You are an AI commerce assistant for an online store called "Agentic Commerce Protocol".
Your goal is to help users find and purchase futuristic products.
You have access to a set of tools to interact with the store's system.
Based on the user's request, you must decide which tool to use.
If the user asks a general question, you can answer it directly without using a tool.
When the user wants to checkout, use the 'checkout' tool. This will start the secure payment process, which you will then guide them through conversationally.

Here is the list of available products you can search and add to the cart:
${productList}

Always be friendly and helpful. When a user wants to add an item, you MUST know its product ID to use the addToCart function.
If a user is vague, like "add the hoodie", you must find its ID from the product list and use it.
For example, to add a "Quantum Hoodie", you should call \`addToCart({ productId: "prod_001", quantity: 1 })\`.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [searchProducts, addToCart, getCart, checkout] }],
        },
    });

    return response;
};
