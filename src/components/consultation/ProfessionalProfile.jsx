import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Clock, Award, GraduationCap, Users, MessageSquare, Video, Phone, Heart, CheckCircle, ExternalLink } from 'lucide-react';

const ProfessionalProfile = ({ professionalId }) => {
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionalData();
  }, [professionalId]);

  const fetchProfessionalData = async () => {
    try {
      setLoading(true);
      const [profileRes, reviewsRes, availabilityRes] = await Promise.all([
        fetch(`/api/professionals/${professionalId}`),
        fetch(`/api/professionals/${professionalId}/reviews`),
        fetch(`/api/professionals/${professionalId}/availability`)
      ]);

      const [profileData, reviewsData, availabilityData] = await Promise.all([
        profileRes.json(),
        reviewsRes.json(),
        availabilityRes.json()
      ]);

      setProfessional(profileData);
      setReviews(reviewsData);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Failed to fetch professional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = () => {
    // Navigate to booking page with pre-selected professional
    window.location.href = `/consultation/book?professional=${professionalId}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Not Found</h2>
        <p className="text-gray-600">The requested professional profile could not be found.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'experience', name: 'Experience', icon: Award },
    { id: 'reviews', name: 'Reviews', icon: MessageSquare },
    { id: 'availability', name: 'Availability', icon: Calendar }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={professional.avatar || '/api/placeholder/120/120'}
              alt={professional.name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{professional.name}</h1>
              <p className="text-blue-100 text-lg mb-2">{professional.specialty}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{professional.rating}</span>
                  <span className="text-blue-200">({professional.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{professional.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{professional.patientsCount}+ patients</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{professional.experience} years experience</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">${professional.consultationFee}</div>
              <div className="text-blue-200 text-sm">per consultation</div>
              <div className="mt-2 text-sm">
                <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  Available Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleBookConsultation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Book Video Consultation</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4" />
              <span>Voice Call</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{professional.bio}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {professional.specializations?.map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {professional.languages?.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {professional.services?.map((service, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="text-sm font-medium text-blue-600">${service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              <div className="space-y-4">
                {professional.education?.map((edu, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-blue-600">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
              <div className="space-y-4">
                {professional.workExperience?.map((work, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Award className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{work.position}</h4>
                      <p className="text-blue-600">{work.organization}</p>
                      <p className="text-sm text-gray-600">{work.duration}</p>
                      <p className="text-sm text-gray-700 mt-1">{work.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {professional.certifications?.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <p className="text-sm text-blue-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-600">{cert.year}</p>
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Patient Reviews</h3>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold">{professional.rating}</span>
                <span className="text-gray-600">({professional.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.patientName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {review.consultationType}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.response && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">Response from Dr. {professional.name}:</p>
                      <p className="text-sm text-gray-700 mt-1">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Available Time Slots</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((day) => (
                <div key={day.date} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleBookConsultation()}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          slot.available
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalProfile;