import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Star, MapPin, DollarSign, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';

const ConsultationBooking = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    experience: '',
    language: ''
  });
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({});

  const specialties = [
    { id: 'general', name: 'General Practitioner', icon: '🩺' },
    { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
    { id: 'dermatology', name: 'Dermatology', icon: '🧴' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'psychology', name: 'Psychology', icon: '🧠' },
    { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏃' },
    { id: 'pediatrics', name: 'Pediatrics', icon: '👶' },
    { id: 'gynecology', name: 'Gynecology', icon: '👩‍⚕️' }
  ];

  useEffect(() => {
    fetchProfessionals();
  }, [selectedSpecialty, filters, searchQuery]);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedProfessional, selectedDate]);

  const fetchProfessionals = async () => {
    try {
      const queryParams = new URLSearchParams({
        specialty: selectedSpecialty,
        search: searchQuery,
        ...filters
      });
      
      const response = await fetch(`/api/professionals?${queryParams}`);
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/professionals/${selectedProfessional.id}/availability?date=${selectedDate}`);
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
    }
  };

  const handleBookConsultation = async () => {
    try {
      const bookingPayload = {
        professionalId: selectedProfessional.id,
        date: selectedDate,
        time: selectedTime,
        type: 'video',
        specialty: selectedSpecialty,
        ...bookingData
      };

      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const result = await response.json();
        setBookingStep(4); // Success step
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book consultation. Please try again.');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const ProfessionalCard = ({ professional }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
        selectedProfessional?.id === professional.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedProfessional(professional)}
    >
      <div className="flex items-start space-x-4">
        <img
          src={professional.avatar || '/api/placeholder/80/80'}
          alt={professional.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{professional.name}</h3>
          <p className="text-blue-600 font-medium">{professional.specialty}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{professional.rating}</span>
              <span>({professional.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{professional.location}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>${professional.consultationFee}</span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {professional.nextAvailable}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {professional.bio}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {professional.languages?.map((lang, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (bookingStep === 4) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your consultation with Dr. {selectedProfessional?.name} has been scheduled for {selectedDate} at {selectedTime}.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => alert('Joining video call...')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Video Call
          </button>
          <button 
            onClick={() => alert('Viewing appointment details...')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Appointment Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Video Consultation</h1>
        <p className="text-gray-600">Connect with healthcare professionals from the comfort of your home</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              bookingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 ${
                bookingStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Specialty and Professional */}
      {bookingStep === 1 && (
        <div className="space-y-6">
          {/* Specialty Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Specialty</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                  className={`p-4 rounded-lg border-2 transition-colors text-center ${
                    selectedSpecialty === specialty.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{specialty.icon}</div>
                  <div className="text-sm font-medium">{specialty.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button 
              onClick={() => alert('Opening filters...')}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Professionals List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Professionals</h2>
            <div className="space-y-4">
              {professionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setBookingStep(2)}
              disabled={!selectedProfessional}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Date and Time */}
      {bookingStep === 2 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Selected Professional</h3>
            <p className="text-blue-800">{selectedProfessional?.name} - {selectedProfessional?.specialty}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
              <div className="space-y-2">
                {getNextSevenDays().map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedDate === date.toISOString().split('T')[0]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div className="text-sm text-gray-600">{date.toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2">
                  {generateTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Please select a date first</p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setBookingStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setBookingStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation and Payment */}
      {bookingStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Your Booking</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Consultation Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Professional:</span>
                <span className="font-medium">{selectedProfessional?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialty:</span>
                <span className="font-medium">{selectedProfessional?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium flex items-center">
                  <Video className="w-4 h-4 mr-1" />
                  Video Consultation
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-semibold text-lg">${selectedProfessional?.consultationFee}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Information</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Please join the video call 5 minutes before your appointment</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Have your medical history and current medications ready</li>
                  <li>• Cancellations must be made at least 24 hours in advance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setBookingStep(2)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBookConsultation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm & Pay ${selectedProfessional?.consultationFee}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationBooking;