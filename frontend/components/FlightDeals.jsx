'use client';

import { useState, useEffect } from 'react';
import {
  Plane,
  Calendar,
  DollarSign,
  TrendingDown,
  Bell,
  Tag,
  ExternalLink,
  Clock,
  MapPin,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';
import { getFlightDeals, getFlightCoupons, getBookingTips } from '../lib/api';

export default function FlightDeals() {
  const [loading, setLoading] = useState(false);
  const [relocationData, setRelocationData] = useState(null);
  const [flightDeals, setFlightDeals] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [bookingTips, setBookingTips] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [priceAlert, setPriceAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search parameters
  const [searchParams, setSearchParams] = useState({
    flexibility: 'moderate',
    classType: 'economy',
    stops: 'any',
    timeOfDay: 'any'
  });

  useEffect(() => {
    const data = sessionStorage.getItem('relocationData');
    if (data) {
      setRelocationData(JSON.parse(data));
    }
  }, []);

  const handleSearchFlights = async () => {
    if (!relocationData?.destinationCountry) {
      alert('Please complete the onboarding form first to set your destination.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      // Fetch flight deals
      const dealsResponse = await getFlightDeals({
        from_location: relocationData.homeCountry || 'Your Location',
        to: relocationData.destinationCountry,
        departureDate: relocationData.departureDate || null,
        flexibility: searchParams.flexibility,
        classType: searchParams.classType,
        stops: searchParams.stops
      });

      // Fetch coupons
      const couponsResponse = await getFlightCoupons({
        destination: relocationData.destinationCountry
      });

      // Fetch booking tips
      const tipsResponse = await getBookingTips({
        destination: relocationData.destinationCountry,
        travelType: 'relocation'
      });

      console.log('Deals Response:', dealsResponse.data);
      console.log('Coupons Response:', couponsResponse.data);
      console.log('Tips Response:', tipsResponse.data);

      // Check if response contains error or quota exceeded
      if (dealsResponse.data?.error || dealsResponse.data?.raw_text?.includes('quota')) {
        console.log('Using fallback deals due to quota/error');
        setErrorMessage('AI service temporarily unavailable (quota limit reached). Showing sample deals instead.');
        setFlightDeals(getFallbackFlightDeals());
      } else if (dealsResponse.data?.deals) {
        console.log('Using AI-generated deals');
        setFlightDeals(dealsResponse.data);
      } else {
        console.log('No deals found, using fallback');
        setErrorMessage('Unable to generate flight deals. Showing sample deals instead.');
        setFlightDeals(getFallbackFlightDeals());
      }

      setCoupons(couponsResponse.data.coupons || getFallbackCoupons());

      if (tipsResponse.data?.error || tipsResponse.data?.raw_text?.includes('quota')) {
        setBookingTips(getFallbackBookingTips());
      } else {
        setBookingTips(tipsResponse.data.tips || getFallbackBookingTips());
      }
    } catch (error) {
      console.error('Error fetching flight deals:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set fallback data
      setErrorMessage('Unable to fetch live flight data. Showing sample deals instead.');
      setFlightDeals(getFallbackFlightDeals());
      setCoupons(getFallbackCoupons());
      setBookingTips(getFallbackBookingTips());
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handlePriceAlert = () => {
    setPriceAlert(!priceAlert);
    if (!priceAlert) {
      alert('Price alerts enabled! We\'ll notify you when prices drop.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Flight Deals & Booking Tips</h2>
            <p className="text-sm text-slate-600">Find the best prices and save on your flights</p>
          </div>
        </div>

        {relocationData?.destinationCountry && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-slate-700">
              Flying to <strong>{relocationData.destinationCountry}</strong>
              {relocationData.departureDate && (
                <> on <strong>{new Date(relocationData.departureDate).toLocaleDateString()}</strong></>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Search Filters */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Customize Your Search
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Flexibility */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Flexibility
            </label>
            <select
              value={searchParams.flexibility}
              onChange={(e) => setSearchParams({ ...searchParams, flexibility: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="exact">Exact Dates</option>
              <option value="moderate">±3 Days</option>
              <option value="flexible">±7 Days</option>
              <option value="very-flexible">±14 Days</option>
            </select>
          </div>

          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cabin Class
            </label>
            <select
              value={searchParams.classType}
              onChange={(e) => setSearchParams({ ...searchParams, classType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="economy">Economy</option>
              <option value="premium-economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>

          {/* Stops */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Stops
            </label>
            <select
              value={searchParams.stops}
              onChange={(e) => setSearchParams({ ...searchParams, stops: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="nonstop">Nonstop Only</option>
              <option value="one">1 Stop or Less</option>
            </select>
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Time
            </label>
            <select
              value={searchParams.timeOfDay}
              onChange={(e) => setSearchParams({ ...searchParams, timeOfDay: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="any">Any Time</option>
              <option value="morning">Morning (6AM-12PM)</option>
              <option value="afternoon">Afternoon (12PM-6PM)</option>
              <option value="evening">Evening (6PM-12AM)</option>
              <option value="night">Night (12AM-6AM)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearchFlights}
          disabled={loading || !relocationData?.destinationCountry}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Searching Best Deals...
            </>
          ) : (
            <>
              <Plane className="w-5 h-5" />
              Search Flight Deals
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="glass-card p-4 border-l-4 border-warning bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Note</p>
              <p className="text-sm text-slate-600">{errorMessage}</p>
              <p className="text-xs text-slate-500 mt-2">
                The AI service has a free tier limit of 20 requests per minute. Please wait a moment and try again, or use the sample data below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Coupons */}
      {coupons.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            Active Coupon Codes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon, index) => (
              <div
                key={index}
                className="border-2 border-dashed border-accent/30 rounded-lg p-4 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-accent" />
                      <span className="font-bold text-accent">{coupon.discount}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{coupon.provider}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-1 shadow-md"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span className="text-white">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-white" />
                        <span className="text-white">{coupon.code}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-2">{coupon.description}</p>
                {coupon.expiryDate && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    Valid until {coupon.expiryDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight Deals */}
      {flightDeals && flightDeals.deals && flightDeals.deals.length > 0 ? (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" />
              Best Flight Deals ({flightDeals.deals.length} options)
            </h3>
            <button
              onClick={handlePriceAlert}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                priceAlert
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bell className={`w-4 h-4 ${priceAlert ? 'animate-pulse' : ''}`} />
              {priceAlert ? 'Alert Active' : 'Set Price Alert'}
            </button>
          </div>

          <div className="space-y-4">
            {flightDeals.deals?.map((deal, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{deal.airline}</p>
                      <p className="text-sm text-slate-600">{deal.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{deal.price}</div>
                    {deal.originalPrice && (
                      <div className="text-sm text-slate-500 line-through">{deal.originalPrice}</div>
                    )}
                    {deal.savings && (
                      <div className="text-xs text-success font-semibold">Save {deal.savings}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{deal.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{deal.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{deal.stops}</span>
                  </div>
                  {deal.badge && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-warning font-semibold">{deal.badge}</span>
                    </div>
                  )}
                </div>

                <a
                  href={deal.bookingLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Book Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Price Insights */}
          {flightDeals.priceInsights && (
            <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Price Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Best Time to Book</p>
                    <p className="text-sm font-semibold text-slate-700">{flightDeals.priceInsights.bestTimeToBook}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className={`w-4 h-4 mt-0.5 ${
                    flightDeals.priceInsights.priceTrend === 'decreasing' ? 'text-success' : 'text-warning'
                  }`} />
                  <div>
                    <p className="text-xs text-slate-500">Price Trend</p>
                    <p className="text-sm font-semibold text-slate-700 capitalize">{flightDeals.priceInsights.priceTrend}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Average Price</p>
                    <p className="text-sm font-semibold text-slate-700">{flightDeals.priceInsights.averagePrice}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Cheapest Month</p>
                    <p className="text-sm font-semibold text-slate-700">{flightDeals.priceInsights.cheapestMonth}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Recommendations */}
          {flightDeals.recommendations && flightDeals.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-info/5 rounded-xl border border-info/20">
              <h5 className="font-semibold text-sm mb-2 flex items-center gap-2 text-info">
                <Sparkles className="w-4 h-4" />
                Quick Tips
              </h5>
              <ul className="space-y-1.5">
                {flightDeals.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-info mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : flightDeals && (!flightDeals.deals || flightDeals.deals.length === 0) ? (
        <div className="glass-card p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-warning" />
          <p className="text-slate-700 font-semibold mb-2">No flight deals available</p>
          <p className="text-sm text-slate-600">
            The API is currently experiencing issues. Please try again in a moment.
          </p>
        </div>
      ) : null}

      {/* Booking Tips */}
      {bookingTips.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-info" />
            Pro Booking Tips
          </h3>

          <div className="space-y-3">
            {bookingTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-info/5 to-transparent rounded-lg border-l-4 border-info"
              >
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-info font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 mb-1">{tip.title}</p>
                  <p className="text-sm text-slate-600">{tip.description}</p>
                  {tip.savings && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
                      <DollarSign className="w-3 h-3" />
                      Potential savings: {tip.savings}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!flightDeals && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Plane className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Find Great Deals?</h3>
          <p className="text-slate-600 mb-4">
            Click "Search Flight Deals" to discover the best prices and exclusive coupons for your journey.
          </p>
        </div>
      )}
    </div>
  );
}

// Fallback data functions
function getFallbackFlightDeals() {
  return {
    deals: [
      {
        airline: 'Air India',
        route: 'New York (JFK) → Delhi (DEL)',
        price: '$750',
        originalPrice: '$950',
        savings: '$200',
        date: 'March 15, 2025',
        duration: '14h 30m',
        stops: 'Nonstop',
        badge: 'Best Value',
        bookingLink: 'https://www.skyscanner.com/transport/flights/nyca/del/'
      },
      {
        airline: 'Emirates',
        route: 'New York (JFK) → Mumbai (BOM)',
        price: '$820',
        originalPrice: '$1050',
        savings: '$230',
        date: 'March 15, 2025',
        duration: '16h 45m',
        stops: '1 stop (Dubai)',
        badge: 'Premium Service',
        bookingLink: 'https://www.skyscanner.com/transport/flights/nyca/bom/'
      },
      {
        airline: 'United Airlines',
        route: 'San Francisco (SFO) → Bangalore (BLR)',
        price: '$680',
        originalPrice: '$890',
        savings: '$210',
        date: 'March 15, 2025',
        duration: '19h 20m',
        stops: '1 stop',
        badge: 'Lowest Price',
        bookingLink: 'https://www.skyscanner.com/transport/flights/sfo/blr/'
      },
      {
        airline: 'Qatar Airways',
        route: 'Chicago (ORD) → Hyderabad (HYD)',
        price: '$795',
        originalPrice: '$1020',
        savings: '$225',
        date: 'March 15, 2025',
        duration: '18h 15m',
        stops: '1 stop (Doha)',
        badge: 'Fastest',
        bookingLink: 'https://www.skyscanner.com/transport/flights/chia/hyd/'
      }
    ],
    priceInsights: {
      bestTimeToBook: 'Book 6-8 weeks in advance for best prices',
      priceTrend: 'increasing',
      averagePrice: '$850',
      cheapestMonth: 'February'
    },
    recommendations: [
      'Book on Tuesday or Wednesday for lower prices',
      'Consider flying mid-week (Tuesday-Thursday) for 15-20% savings',
      'Set price alerts on multiple booking sites',
      'Check both direct and one-stop flights - sometimes one-stop is much cheaper'
    ]
  };
}

function getFallbackCoupons() {
  return [
    {
      code: 'FIRST15',
      provider: 'Major Booking Site',
      discount: '15% OFF',
      description: 'First-time international booking discount',
      expiryDate: 'Dec 31, 2025'
    },
    {
      code: 'STUDENT20',
      provider: 'Student Travel Agency',
      discount: '20% OFF',
      description: 'Student verification required',
      expiryDate: 'Jun 30, 2026'
    },
    {
      code: 'EARLYBIRD',
      provider: 'Airlines Direct',
      discount: '$50 OFF',
      description: 'Book 60+ days in advance',
      expiryDate: 'Ongoing'
    }
  ];
}

function getFallbackBookingTips() {
  return [
    {
      title: 'Book on Tuesday or Wednesday',
      description: 'Airlines typically release deals early in the week. Prices are generally lowest on Tuesdays around 3PM EST.',
      savings: 'Up to 20%'
    },
    {
      title: 'Use Incognito Mode',
      description: 'Clear cookies or browse in incognito to avoid dynamic pricing based on your search history.',
      savings: 'Avoid price hikes'
    },
    {
      title: 'Book 6-8 Weeks in Advance',
      description: 'International flights are typically cheapest 6-8 weeks before departure for optimal pricing.',
      savings: 'Up to 30%'
    },
    {
      title: 'Consider Nearby Airports',
      description: 'Flying into a nearby city and taking ground transport can save significantly on airfare.',
      savings: 'Up to $200'
    },
    {
      title: 'Set Price Alerts',
      description: 'Use price tracking tools to monitor fare changes and book when prices drop.',
      savings: 'Never miss deals'
    }
  ];
}
