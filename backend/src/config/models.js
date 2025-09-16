/**
 * AI Model Configuration
 * 
 * Defines the supported AI models, their providers, and validation rules.
 * This centralized configuration allows for easy updates and management of
 * available models for the Vercel AI Gateway proxy.
 */

const supportedModels = {
  // OpenAI Models
  'gpt-4o-realtime-preview': { provider: 'openai', type: 'realtime' },
  'gpt-realtime': { provider: 'openai', type: 'realtime' },
  'gpt-4-realtime': { provider: 'openai', type: 'realtime' },
  'gpt-4o': { provider: 'openai', type: 'text' },
  'gpt-4-turbo': { provider: 'openai', type: 'text' },
  'gpt-3.5-turbo': { provider: 'openai', type: 'text' },

  // Anthropic Models
  'claude-3-5-sonnet-20240620': { provider: 'anthropic', type: 'text' },
  'claude-3-opus-20240229': { provider: 'anthropic', type: 'text' },
  'claude-3-haiku-20240307': { provider: 'anthropic', type: 'text' },

  // xAI Models
  'grok-1.5': { provider: 'xai', type: 'text' },

  // Google Models
  'gemini-1.5-pro-latest': { provider: 'google', type: 'text' },
  'gemini-pro': { provider: 'google', type: 'text' },

  // Meta Models
  'llama3-70b-8192': { provider: 'meta', type: 'text' },
  'llama3-8b-8192': { provider: 'meta', type: 'text' },

  // Mistral Models
  'mistral-large-latest': { provider: 'mistral', type: 'text' },
};

/**
 * Checks if a model is supported.
 * @param {string} modelId The ID of the model to check.
 * @returns {boolean} True if the model is supported, false otherwise.
 */
function isModelSupported(modelId) {
  return Object.keys(supportedModels).includes(modelId);
}

/**
 * Gets the configuration for a specific model.
 * @param {string} modelId The ID of the model.
 * @returns {object|null} The model configuration or null if not found.
 */
function getModelConfig(modelId) {
  return supportedModels[modelId] || null;
}

module.exports = {
  supportedModels,
  isModelSupported,
  getModelConfig,
};
