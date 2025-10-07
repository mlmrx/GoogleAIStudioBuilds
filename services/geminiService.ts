import { GoogleGenAI, FunctionDeclaration, Type, Chat, GenerateContentResponse, Part } from '@google/genai';

// FIX: Initialize the generative AI client using the correct API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are a helpful and friendly e-commerce assistant for an Apple products retailer.
- Your goal is to help users find products, add them to their cart, and complete purchases.
- Always use the provided tools to perform actions like searching, adding to cart, and checking out.
- When searching, if the user provides a generic query, ask for clarification or suggest categories.
- When a user asks to add an item, confirm the quantity. Default to 1 if not specified.
- The product catalog is available via the \`searchProducts\` function. Do not make up products.
- The product ID is a slug, for example: "apple-iphone-15-pro".
- Be conversational and guide the user through the process.
- Do not ask for payment details, just use the confirmAndPay function when the user is ready.`;

// Define the functions the agent can call
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'searchProducts',
    description: 'Search for products based on a query or category. This should be the first step for any product-related inquiry.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'A search term, like "phone" or "laptop". Can be a product name, feature, or description.' },
        category: { type: Type.STRING, description: 'A product category to filter by, e.g., "Phones", "Computers".' },
      },
      required: [],
    },
  },
  {
    name: 'addToCart',
    description: 'Add a specific product to the shopping cart.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: { type: Type.STRING, description: 'The unique ID of the product to add. The ID is a slug, e.g. "apple-iphone-15-pro".' },
        quantity: { type: Type.INTEGER, description: 'The number of units to add. Defaults to 1 if not specified.' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'viewCart',
    description: 'View the current contents of the shopping cart.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'initiateCheckout',
    description: 'Starts the checkout process for the items in the cart. The user must confirm after this step.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'confirmAndPay',
    description: 'Confirms the order and processes the payment. This is the final step in the checkout process.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: 'cancelCheckout',
    description: 'Cancels the checkout process and returns to browsing.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
];

let chat: Chat;

export const startChatSession = () => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      tools: [{ functionDeclarations }],
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessage = async (message: string | Part | (string | Part)[]): Promise<GenerateContentResponse> => {
  if (!chat) {
    startChatSession();
  }
  const result = await chat.sendMessage({ message });
  return result;
};
