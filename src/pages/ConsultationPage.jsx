import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import VideoConsultation from '../components/consultation/VideoConsultation';
import ConsultationBooking from '../components/consultation/ConsultationBooking';
import ConsultationDashboard from '../components/consultation/ConsultationDashboard';
import ProfessionalProfile from '../components/consultation/ProfessionalProfile';
import { Video, Calendar, User, ArrowLeft, Stethoscope, Clock, Star, MapPin } from 'lucide-react';

const ConsultationPage = () => {
  const { action, id } = useParams();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Determine view based on URL parameters
    if (action === 'video' && id) {
      setCurrentView('video');
    } else if (action === 'book') {
      setCurrentView('booking');
    } else if (action === 'professional' && id) {
      setCurrentView('profile');
    } else {
      setCurrentView('dashboard');
    }
  }, [action, id]);

  const renderHeader = () => {
    const getHeaderContent = () => {
      switch (currentView) {
        case 'video':
          return {
            title: 'Video Consultation',
            subtitle: 'Secure video call with your healthcare professional',
            icon: <Video className="w-8 h-8" />
          };
        case 'booking':
          return {
            title: 'Book Consultation',
            subtitle: 'Schedule an appointment with a healthcare professional',
            icon: <Calendar className="w-8 h-8" />
          };
        case 'profile':
          return {
            title: 'Professional Profile',
            subtitle: 'View detailed information about the healthcare professional',
            icon: <User className="w-8 h-8" />
          };
        default:
          return {
            title: 'My Consultations',
            subtitle: 'Manage your healthcare appointments and video consultations',
            icon: <Stethoscope className="w-8 h-8" />
          };
      }
    };

    const { title, subtitle, icon } = getHeaderContent();

    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            {currentView !== 'dashboard' && (
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-700 rounded-lg">
                {icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-blue-100 mt-1">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickStats = () => {
    if (currentView !== 'dashboard') return null;

    return (
      <div className="max-w-6xl mx-auto px-6 -mt-6 mb-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">45m</p>
                <p className="text-sm text-gray-600">Avg Duration</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturedProfessionals = () => {
    if (currentView !== 'dashboard') return null;

    const featuredProfessionals = [
      {
        id: 'prof-1',
        name: 'Dr. Sarah Johnson',
        specialty: 'General Practitioner',
        rating: 4.9,
        reviewCount: 127,
        location: 'New York, NY',
        nextAvailable: 'Available today',
        avatar: '/api/placeholder/80/80'
      },
      {
        id: 'prof-2',
        name: 'Dr. Michael Chen',
        specialty: 'Cardiology',
        rating: 4.8,
        reviewCount: 89,
        location: 'Los Angeles, CA',
        nextAvailable: 'Available tomorrow',
        avatar: '/api/placeholder/80/80'
      },
      {
        id: 'prof-3',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Dermatology',
        rating: 4.7,
        reviewCount: 156,
        location: 'Miami, FL',
        nextAvailable: 'Available in 2 days',
        avatar: '/api/placeholder/80/80'
      }
    ];

    return (
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Professionals</h2>
            <button
              onClick={() => setCurrentView('booking')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProfessionals.map((professional) => (
              <div
                key={professional.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/consultation/professional/${professional.id}`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                    <p className="text-blue-600 text-sm">{professional.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{professional.rating} ({professional.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{professional.location}</span>
                  </div>
                  <div className="text-green-600 font-medium">
                    {professional.nextAvailable}
                  </div>
                </div>
                
                <button 
                  onClick={() => alert('Book consultation with this professional')}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'video':
        return <VideoConsultation consultationId={id} />;
      case 'booking':
        return <ConsultationBooking />;
      case 'profile':
        return <ProfessionalProfile professionalId={id} />;
      default:
        return (
          <>
            {renderQuickStats()}
            {renderFeaturedProfessionals()}
            <ConsultationDashboard />
          </>
        );
    }
  };

  // For video consultation, render full screen without header
  if (currentView === 'video') {
    return <VideoConsultation consultationId={id} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default ConsultationPage;