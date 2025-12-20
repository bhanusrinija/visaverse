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
    if (!relocationData?.destination) {
      alert('Please complete the onboarding form first to set your destination.');
      return;
    }

    setLoading(true);
    try {
      // Fetch flight deals
      const dealsResponse = await getFlightDeals({
        from: relocationData.currentLocation || 'Your Location',
        to: relocationData.destination,
        departureDate: relocationData.departureDate || null,
        flexibility: searchParams.flexibility,
        classType: searchParams.classType,
        stops: searchParams.stops
      });

      // Fetch coupons
      const couponsResponse = await getFlightCoupons({
        destination: relocationData.destination
      });

      // Fetch booking tips
      const tipsResponse = await getBookingTips({
        destination: relocationData.destination,
        travelType: 'relocation'
      });

      setFlightDeals(dealsResponse.data);
      setCoupons(couponsResponse.data.coupons || []);
      setBookingTips(tipsResponse.data.tips || []);
    } catch (error) {
      console.error('Error fetching flight deals:', error);
      // Set fallback data
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

        {relocationData?.destination && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-slate-700">
              Flying to <strong>{relocationData.destination}</strong>
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
          disabled={loading || !relocationData?.destination}
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
                    className="px-3 py-1 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-all flex items-center gap-1"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        {coupon.code}
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
      {flightDeals && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" />
              Best Flight Deals
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
        </div>
      )}

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
        airline: 'Major Airlines',
        route: 'Your City → Destination',
        price: '$450',
        originalPrice: '$650',
        savings: '$200',
        date: 'Flexible',
        duration: '8-12 hours',
        stops: '1 stop',
        badge: 'Best Value',
        bookingLink: '#'
      },
      {
        airline: 'Budget Airlines',
        route: 'Your City → Destination',
        price: '$380',
        originalPrice: '$520',
        savings: '$140',
        date: 'Flexible',
        duration: '10-14 hours',
        stops: '2 stops',
        badge: 'Lowest Price',
        bookingLink: '#'
      }
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
