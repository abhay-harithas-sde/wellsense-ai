// Session Analysis Service
// Frontend service for analyzing chat sessions

class SessionAnalysisService {
  constructor() {
    // Use relative path in production, localhost in development
    this.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('wellsense_token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Analyze a specific chat session
   * @param {string} sessionId - The session ID to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<object>} Analysis results
   */
  async analyzeSession(sessionId, options = {}) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/session-analysis/analyze/${sessionId}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            includeRecommendations: options.includeRecommendations !== false
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Session analysis failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        analysis: data.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Session analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get session analysis history
   * @param {number} limit - Number of sessions to retrieve
   * @returns {Promise<object>} Session history
   */
  async getAnalysisHistory(limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/session-analysis/history?limit=${limit}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sessions: data.data.sessions,
        total: data.data.total
      };
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compare multiple sessions
   * @param {string[]} sessionIds - Array of session IDs to compare
   * @returns {Promise<object>} Comparison results
   */
  async compareSessions(sessionIds) {
    try {
      if (!sessionIds || sessionIds.length < 2) {
        throw new Error('Please provide at least 2 session IDs to compare');
      }

      const response = await fetch(
        `${this.baseURL}/api/session-analysis/compare`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ sessionIds })
        }
      );

      if (!response.ok) {
        throw new Error(`Session comparison failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        comparison: data.data.comparison,
        insights: data.data.insights
      };
    } catch (error) {
      console.error('Session comparison error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format analysis for display
   * @param {object} analysis - Raw analysis data
   * @returns {object} Formatted analysis
   */
  formatAnalysis(analysis) {
    if (!analysis) return null;

    return {
      sessionId: analysis.sessionId,
      metrics: {
        duration: `${analysis.sessionMetrics.duration} minutes`,
        totalMessages: analysis.sessionMetrics.totalMessages,
        userEngagement: `${analysis.sessionMetrics.userMessages} messages`,
        avgMessageLength: `${analysis.sessionMetrics.avgMessageLength} characters`
      },
      topics: analysis.keyTopics.map(topic => 
        topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ),
      aiInsights: analysis.aiAnalysis,
      timestamp: new Date(analysis.timestamp).toLocaleString()
    };
  }

  /**
   * Extract action items from analysis
   * @param {string} analysisText - AI analysis text
   * @returns {string[]} List of action items
   */
  extractActionItems(analysisText) {
    if (!analysisText) return [];

    const lines = analysisText.split('\n');
    const actionItems = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Look for numbered lists, bullet points, or lines starting with action verbs
      if (
        trimmed.match(/^\d+\./) || 
        trimmed.startsWith('•') || 
        trimmed.startsWith('-') ||
        trimmed.match(/^(Try|Start|Continue|Consider|Focus|Track|Monitor|Schedule)/i)
      ) {
        const cleaned = trimmed.replace(/^\d+\.\s*|^[•-]\s*/, '');
        if (cleaned.length > 10) {
          actionItems.push(cleaned);
        }
      }
    }

    return actionItems.slice(0, 10); // Return top 10 action items
  }

  /**
   * Get session health score
   * @param {object} sessionMetrics - Session metrics
   * @returns {number} Health score (0-100)
   */
  calculateSessionHealthScore(sessionMetrics) {
    if (!sessionMetrics) return 0;

    let score = 0;

    // Duration score (max 30 points)
    if (sessionMetrics.duration >= 10) score += 30;
    else if (sessionMetrics.duration >= 5) score += 20;
    else if (sessionMetrics.duration >= 2) score += 10;

    // Engagement score (max 40 points)
    if (sessionMetrics.userMessages >= 10) score += 40;
    else if (sessionMetrics.userMessages >= 5) score += 30;
    else if (sessionMetrics.userMessages >= 3) score += 20;
    else if (sessionMetrics.userMessages >= 1) score += 10;

    // Message quality score (max 30 points)
    if (sessionMetrics.avgMessageLength >= 100) score += 30;
    else if (sessionMetrics.avgMessageLength >= 50) score += 20;
    else if (sessionMetrics.avgMessageLength >= 20) score += 10;

    return Math.min(score, 100);
  }
}

// Export singleton instance
const sessionAnalysisService = new SessionAnalysisService();
export default sessionAnalysisService;
