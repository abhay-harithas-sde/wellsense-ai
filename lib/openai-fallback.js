/**
 * OpenAI API Fallback Mechanism
 * 
 * Provides cached responses when OpenAI API is unavailable
 * for demo day presentation reliability.
 * 
 * Requirements: 5.6, 8.5, 8.7
 */

import fs from 'fs';
import path from 'path';

// Load cached responses
let cachedResponses = null;

/**
 * Load cached responses from file
 * @returns {Object} Cached responses data
 */
function loadCachedResponses() {
  if (cachedResponses) {
    return cachedResponses;
  }
  
  try {
    const cachePath = path.join(__dirname, '..', 'backup', 'cached-responses.json');
    const data = fs.readFileSync(cachePath, 'utf8');
    cachedResponses = JSON.parse(data);
    return cachedResponses;
  } catch (error) {
    console.error('Failed to load cached responses:', error.message);
    return { responses: [], metadata: {} };
  }
}

/**
 * Calculate similarity score between query and keywords
 * @param {string} query - User query
 * @param {Array<string>} keywords - Keywords to match against
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(query, keywords) {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/);
  
  let matchCount = 0;
  let totalKeywords = keywords.length;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Exact match
    if (queryLower.includes(keywordLower)) {
      matchCount += 2; // Higher weight for exact matches
      continue;
    }
    
    // Word-level match
    const keywordWords = keywordLower.split(/\s+/);
    for (const keywordWord of keywordWords) {
      if (queryWords.some(qw => qw.includes(keywordWord) || keywordWord.includes(qw))) {
        matchCount += 1;
        break;
      }
    }
  }
  
  return matchCount / (totalKeywords * 2); // Normalize to 0-1
}

/**
 * Find best matching cached response for a query
 * @param {string} query - User query
 * @returns {Object|null} Best matching response or null
 */
function findBestMatch(query) {
  const cache = loadCachedResponses();
  
  if (!cache.responses || cache.responses.length === 0) {
    return null;
  }
  
  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.2; // Minimum similarity threshold (lowered to catch exact single keyword matches)
  
  for (const response of cache.responses) {
    const score = calculateSimilarity(query, response.keywords);
    
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = response;
    }
  }
  
  return bestMatch ? { ...bestMatch, matchScore: bestScore } : null;
}

/**
 * Get cached response for a query
 * @param {string} query - User query
 * @returns {string|null} Cached response or null
 */
function getCachedResponse(query) {
  const match = findBestMatch(query);
  
  if (match) {
    console.log(`[Fallback] Using cached response (ID: ${match.id}, Score: ${match.matchScore.toFixed(2)})`);
    return match.response;
  }
  
  return null;
}

/**
 * Call OpenAI API with fallback to cached responses
 * @param {string} prompt - User prompt
 * @param {Object} options - OpenAI API options
 * @returns {Promise<string>} Response text
 */
async function callOpenAIWithFallback(prompt, options = {}) {
  const { openai, model = 'gpt-3.5-turbo', maxRetries = 2, timeout = 10000 } = options;
  
  // Try OpenAI API first
  if (openai) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[OpenAI] Attempt ${attempt}/${maxRetries}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        }, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const content = response.choices[0]?.message?.content;
        if (content) {
          console.log('[OpenAI] Success');
          return content;
        }
        
      } catch (error) {
        console.warn(`[OpenAI] Attempt ${attempt} failed:`, error.message);
        
        // If this was the last attempt, fall back to cache
        if (attempt === maxRetries) {
          console.log('[OpenAI] All attempts failed, falling back to cache');
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  // Fallback to cached responses
  console.log('[Fallback] Using cached response system');
  const cachedResponse = getCachedResponse(prompt);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Ultimate fallback - generic response
  console.warn('[Fallback] No matching cached response found');
  return "I'm here to help with your health and wellness questions. Could you please rephrase your question? I can assist with nutrition advice, workout planning, weight management, and general wellness guidance.";
}

/**
 * Test the fallback system
 * @returns {Promise<Object>} Test results
 */
async function testFallbackSystem() {
  console.log('🧪 Testing OpenAI Fallback System\n');
  
  const testQueries = [
    'How can I lose weight?',
    'What should I eat for breakfast?',
    'I need a workout routine',
    'How to reduce stress?',
    'Tell me about protein intake',
    'Random query that should not match'
  ];
  
  const results = {
    total: testQueries.length,
    matched: 0,
    unmatched: 0,
    details: []
  };
  
  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    const match = findBestMatch(query);
    
    if (match) {
      console.log(`  ✓ Matched: ${match.id} (Score: ${match.matchScore.toFixed(2)})`);
      console.log(`  Response: ${match.response.substring(0, 100)}...`);
      results.matched++;
      results.details.push({ query, matched: true, id: match.id, score: match.matchScore });
    } else {
      console.log(`  ✗ No match found`);
      results.unmatched++;
      results.details.push({ query, matched: false });
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('Test Results:');
  console.log(`  Total Queries: ${results.total}`);
  console.log(`  Matched: ${results.matched}`);
  console.log(`  Unmatched: ${results.unmatched}`);
  console.log(`  Success Rate: ${((results.matched / results.total) * 100).toFixed(1)}%`);
  
  return results;
}

/**
 * Get statistics about cached responses
 * @returns {Object} Statistics
 */
function getCacheStatistics() {
  const cache = loadCachedResponses();
  
  return {
    totalResponses: cache.responses?.length || 0,
    version: cache.metadata?.version || 'unknown',
    lastUpdated: cache.metadata?.lastUpdated || 'unknown',
    categories: [...new Set(cache.responses?.map(r => r.id.split('-')[0]) || [])],
    averageKeywordsPerResponse: cache.responses?.length > 0
      ? (cache.responses.reduce((sum, r) => sum + r.keywords.length, 0) / cache.responses.length).toFixed(1)
      : 0
  };
}

// Run test if called directly
if (require.main === module) {
  testFallbackSystem()
    .then(() => {
      console.log('\n📊 Cache Statistics:');
      const stats = getCacheStatistics();
      console.log(JSON.stringify(stats, null, 2));
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export default {
  callOpenAIWithFallback,
  getCachedResponse,
  findBestMatch,
  testFallbackSystem,
  getCacheStatistics,
  loadCachedResponses
};
