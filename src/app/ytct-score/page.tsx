import { Clock, Activity, TrendingUp, Eye } from 'lucide-react';
import { YTCTScore } from '@/components/score/YTCTScore';

export default function YTCTScorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            What is the <span className="text-blue-600">YTCT Score</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The YouTube Channel Trust (YTCT) Score is a transparent, data-driven metric
            that evaluates YouTube channels on a 1-10 scale based on four key factors:
            Longevity, Consistency, Growth, and Engagement.
          </p>
        </div>

        {/* Score Visualization Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
            <YTCTScore score={9.2} rating="Excellent" size="md" />
            <p className="text-sm text-gray-600 mt-4">Established, consistent creators</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
            <YTCTScore score={6.5} rating="Very Good" size="md" />
            <p className="text-sm text-gray-600 mt-4">Growing channels with potential</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
            <YTCTScore score={3.8} rating="Fair" size="md" />
            <p className="text-sm text-gray-600 mt-4">Newer or irregular channels</p>
          </div>
        </div>

        {/* Scoring Formula */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It's Calculated</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6 font-mono text-sm">
            <p className="text-gray-800">
              <span className="font-bold">YTCT Score</span> =
              <span className="text-purple-600"> (Longevity × 0.30)</span> +
              <span className="text-blue-600"> (Consistency × 0.30)</span> +
              <span className="text-green-600"> (Growth × 0.25)</span> +
              <span className="text-orange-600"> (Engagement × 0.15)</span>
            </p>
          </div>
          <p className="text-gray-600 text-center">
            Each component is normalized to a 1-10 scale, then weighted to produce the final YTCT Score.
          </p>
        </div>

        {/* The Four Components */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">The Four Components</h2>
          <div className="space-y-6">
            {/* Longevity */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-purple-100 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Longevity</h3>
                    <span className="text-lg font-semibold text-purple-600">30% Weight</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Measures how long the channel has existed. Older channels demonstrate staying power,
                    commitment, and proven track records in content creation.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Scoring Thresholds:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• 10+ years: <span className="font-semibold text-purple-600">10.0</span></div>
                      <div>• 5-7 years: <span className="font-semibold text-purple-600">8.0</span></div>
                      <div>• 2-3 years: <span className="font-semibold text-purple-600">6.0</span></div>
                      <div>• &lt; 1 month: <span className="font-semibold text-purple-600">1.0</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consistency */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Consistency</h3>
                    <span className="text-lg font-semibold text-blue-600">30% Weight</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Evaluates upload frequency (videos per month). Regular uploads show dedication,
                    reliability, and active engagement with the audience.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Scoring Thresholds:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• 8+ videos/month: <span className="font-semibold text-blue-600">10.0</span></div>
                      <div>• 4-6 videos/month: <span className="font-semibold text-blue-600">8.0</span></div>
                      <div>• 1-2 videos/month: <span className="font-semibold text-blue-600">5.0</span></div>
                      <div>• &lt; 0.1 videos/month: <span className="font-semibold text-blue-600">1.0</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-green-100">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-green-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Growth Ratio</h3>
                    <span className="text-lg font-semibold text-green-600">25% Weight</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Calculates subscribers gained per video. Higher ratios indicate content that
                    resonates strongly with audiences and attracts new followers effectively.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Scoring Thresholds:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• 10,000+ subs/video: <span className="font-semibold text-green-600">10.0</span></div>
                      <div>• 1,000-2,500 subs/video: <span className="font-semibold text-green-600">7.0</span></div>
                      <div>• 100-250 subs/video: <span className="font-semibold text-green-600">4.0</span></div>
                      <div>• &lt; 10 subs/video: <span className="font-semibold text-green-600">1.0</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-orange-100 rounded-lg">
                  <Eye className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Engagement Rate</h3>
                    <span className="text-lg font-semibold text-orange-600">15% Weight</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Measures the ratio of average views per video to total subscribers.
                    High engagement means subscribers actively watch content, not just subscribe.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Scoring Thresholds:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• &gt; 1.0 ratio: <span className="font-semibold text-orange-600">10.0</span></div>
                      <div>• 0.5-0.75 ratio: <span className="font-semibold text-orange-600">8.0</span></div>
                      <div>• 0.15-0.25 ratio: <span className="font-semibold text-orange-600">5.0</span></div>
                      <div>• &lt; 0.01 ratio: <span className="font-semibold text-orange-600">1.0</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Scale */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Rating Scale</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 w-16">8-10</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Excellent</p>
                <p className="text-sm text-gray-600">Highly established, consistent, and engaging channels</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 w-16">6-7.9</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Very Good</p>
                <p className="text-sm text-gray-600">Strong performers with good metrics across the board</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 w-16">4-5.9</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Good</p>
                <p className="text-sm text-gray-600">Solid channels with room for improvement</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 w-16">2-3.9</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Fair</p>
                <p className="text-sm text-gray-600">Developing channels or inconsistent activity</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600 w-16">1-1.9</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Poor</p>
                <p className="text-sm text-gray-600">Very new channels or inactive accounts</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Why these four metrics?</h3>
              <p className="text-gray-600">
                These metrics provide a holistic view of channel trustworthiness. Longevity and Consistency
                (60% combined) show reliability and commitment. Growth and Engagement (40% combined) demonstrate
                content quality and audience connection.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is a higher score always better?</h3>
              <p className="text-gray-600">
                Generally yes, but context matters. A newer channel with excellent content might have a lower
                score due to Longevity, but could excel in Growth and Engagement. The score is one data point
                among many to consider.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How often is the score updated?</h3>
              <p className="text-gray-600">
                YTCT Scores are calculated in real-time when you search for a channel, using the latest
                available data from YouTube's API. This ensures you always get current information.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can channels improve their score?</h3>
              <p className="text-gray-600">
                Yes! Channels can improve by uploading consistently, creating engaging content that attracts
                subscribers, and maintaining active engagement with their audience over time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Try It Now
          </a>
          <p className="text-gray-600 mt-4">Search any YouTube channel to see its YTCT Score</p>
        </div>
      </div>
    </div>
  );
}
