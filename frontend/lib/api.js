import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Relocation Planner API
export const relocationAPI = {
    getPlan: async (homeCountry, destinationCountry, purpose) => {
        const response = await api.post('/api/relocation/plan', {
            home_country: homeCountry,
            destination_country: destinationCountry,
            purpose: purpose,
        });
        return response.data;
    },
};

// Cultural Guide API
export const cultureAPI = {
    getGuide: async (country, category = 'all') => {
        const response = await api.post('/api/culture/guide', {
            country: country,
            category: category,
        });
        return response.data;
    },
};

// Language & Translation API
export const languageAPI = {
    translate: async (text, sourceLanguage, targetLanguage) => {
        const response = await api.post('/api/language/translate', {
            text: text,
            source_language: sourceLanguage,
            target_language: targetLanguage,
        });
        return response.data;
    },
    getPhrases: async (country, language) => {
        const response = await api.post('/api/language/phrases', {
            country: country,
            language: language,
        });
        return response.data;
    },
};

// Voice AI API
export const voiceAPI = {
    query: async (text, userId = 'anonymous', context = null) => {
        const response = await api.post('/api/voice/query', {
            text: text,
            user_id: userId,
            context: context,
        });
        return response.data;
    },
};

// Currency API
export const currencyAPI = {
    convert: async (amount, fromCurrency, toCurrency) => {
        const response = await api.post('/api/currency/convert', {
            amount: amount,
            from_currency: fromCurrency,
            to_currency: toCurrency,
        });
        return response.data;
    },
    getAdvice: async (destinationCountry, durationDays) => {
        const response = await api.post('/api/currency/advice', {
            destination_country: destinationCountry,
            duration_days: durationDays,
        });
        return response.data;
    },
};

// Document Analysis API
export const documentAPI = {
    analyze: async (file, userId = 'anonymous', documentType = 'visa') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);
        formData.append('document_type', documentType);

        const response = await api.post('/api/documents/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Packing List API
export const packingAPI = {
    getList: async (homeCountry, destinationCountry, durationDays, purpose = 'general') => {
        const response = await api.post('/api/packing/list', {
            home_country: homeCountry,
            destination_country: destinationCountry,
            duration_days: durationDays,
            purpose: purpose,
        });
        return response.data;
    },
};

// Survival Plan API
export const survivalPlanAPI = {
    generate: async (homeCountry, destinationCountry, purpose) => {
        const response = await api.post('/api/survival-plan/generate', {
            home_country: homeCountry,
            destination_country: destinationCountry,
            purpose: purpose,
        });
        return response.data;
    },
};

// Accommodation API
export const accommodationAPI = {
    findForTravelers: async (destinationCountry, city, budgetMin, budgetMax, durationDays, preferences = []) => {
        const response = await api.post('/api/accommodation/travelers', {
            destination_country: destinationCountry,
            city: city,
            user_type: 'traveler',
            budget_min: budgetMin,
            budget_max: budgetMax,
            duration_days: durationDays,
            preferences: preferences,
        });
        return response.data;
    },
    findForStudents: async (destinationCountry, city, budgetMin, budgetMax, preferences = []) => {
        const response = await api.post('/api/accommodation/students', {
            destination_country: destinationCountry,
            city: city,
            user_type: 'student',
            budget_min: budgetMin,
            budget_max: budgetMax,
            preferences: preferences,
        });
        return response.data;
    },
};

// Rental Housing API
export const rentalHousingAPI = {
    getGuide: async (destinationCountry, city = null) => {
        const response = await api.post('/api/rental-housing/guide', {
            destination_country: destinationCountry,
            city: city,
        });
        return response.data;
    },
};

// Itinerary API
export const itineraryAPI = {
    generate: async (destinationCountry, city, durationDays, totalBudget, travelStyle, interests = []) => {
        const response = await api.post('/api/itinerary/generate', {
            destination_country: destinationCountry,
            city: city,
            duration_days: durationDays,
            total_budget: totalBudget,
            travel_style: travelStyle,
            interests: interests,
        });
        return response.data;
    },
};

// First Hours API
export const firstHoursAPI = {
    getChecklist: async (destinationCountry, city = null, arrivalTime = 'daytime') => {
        const response = await api.post('/api/first-hours/checklist', {
            destination_country: destinationCountry,
            city: city,
            arrival_time: arrivalTime,
        });
        return response.data;
    },
};

// Arrival Tasks API
export const arrivalTasksAPI = {
    getTasks: async (destinationCountry, purpose) => {
        const response = await api.post('/api/arrival-tasks/list', {
            destination_country: destinationCountry,
            purpose: purpose,
        });
        return response.data;
    },
};

// Flight Deals API
export const getFlightDeals = async (params) => {
    const response = await api.post('/api/flights/deals', params);
    return response;
};

export const getFlightCoupons = async (params) => {
    const response = await api.post('/api/flights/coupons', params);
    return response;
};

export const getBookingTips = async (params) => {
    const response = await api.post('/api/flights/booking-tips', params);
    return response;
};

// Smart Calendar API
export const getRelocationTimeline = async (params) => {
    const response = await api.post('/api/calendar/timeline', params);
    return response;
};

export const generateCalendarEvents = async (params) => {
    const response = await api.post('/api/calendar/generate-events', params);
    return response;
};

export default api;
