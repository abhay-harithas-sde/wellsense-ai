import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Phone, MessageSquare, Star, Filter, Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ConsultationDashboard = ({ userType = 'patient' }) => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, [activeTab, filterStatus]);

  useEffect(() => {
    // Initialize with sample data on component mount
    if (consultations.length === 0) {
      setConsultations(getSampleConsultations());
      setLoading(false);
    }
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user-id'; // This would come from auth context
      
      // Use the correct API endpoint based on filter status
      let endpoint;
      if (filterStatus === 'upcoming') {
        endpoint = `/api/consultations/user/${userId}/upcoming`;
      } else {
        endpoint = `/api/consultations/user/${userId}`;
      }
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setConsultations(Array.isArray(result.data) ? result.data : []);
      } else {
        throw new Error(result.error || 'Failed to fetch consultations');
      }
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      // Set sample data for demo
      setConsultations(getSampleConsultations());
    } finally {
      setLoading(false);
    }
  };

  const handleJoinConsultation = (consultation) => {
    // Navigate to external video consultation platform with consultation ID
    const meetingLink = `http://meet.wellsense.in/?room=${consultation.id}&name=${encodeURIComponent(consultation.professional?.name || 'User')}`;
    window.open(meetingLink, '_blank');
  };

  const handleCancelConsultation = async (consultationId) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchConsultations(); // Refresh the list
      } else {
        console.error('Failed to cancel consultation:', result.error);
      }
    } catch (error) {
      console.error('Failed to cancel consultation:', error);
    }
  };

  const handleReschedule = (consultation) => {
    // Navigate to booking page with pre-filled data
    navigate(`/consultation/book?reschedule=${consultation.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Video className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredConsultations = Array.isArray(consultations) ? consultations.filter(consultation => {
    const matchesSearch = consultation.professional?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consultation.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'upcoming') {
      return consultation.status === 'scheduled' && matchesSearch;
    } else if (activeTab === 'completed') {
      return consultation.status === 'completed' && matchesSearch;
    } else if (activeTab === 'cancelled') {
      return ['cancelled', 'no_show'].includes(consultation.status) && matchesSearch;
    }
    
    return matchesSearch;
  }) : [];

  const ConsultationCard = ({ consultation }) => {
    const isUpcoming = consultation.status === 'scheduled';
    const canJoin = isUpcoming && isWithinJoinWindow(consultation.date, consultation.time);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <img
              src={consultation.professional?.avatar || '/api/placeholder/60/60'}
              alt={consultation.professional?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {userType === 'patient' ? consultation.professional?.name : consultation.patient?.name}
              </h3>
              <p className="text-blue-600 font-medium">{consultation.specialty}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(consultation.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{consultation.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>{consultation.type}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
              {getStatusIcon(consultation.status)}
              <span className="capitalize">{consultation.status.replace('_', ' ')}</span>
            </span>
            {consultation.rating && (
              <div className="flex items-center space-x-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{consultation.rating}</span>
              </div>
            )}
          </div>
        </div>

        {consultation.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{consultation.notes}</p>
          </div>
        )}

        {isUpcoming && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Meeting Link</p>
                <a 
                  href={`http://meet.wellsense.in/?room=${consultation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  meet.wellsense.in/?room={consultation.id}
                </a>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`http://meet.wellsense.in/?room=${consultation.id}`);
                  alert('Meeting link copied to clipboard!');
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedConsultation(consultation);
                setShowDetails(true);
              }}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            
            {consultation.status === 'completed' && (
              <button 
                onClick={() => alert('Leave a review for this consultation')}
                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Leave Review</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {canJoin && (
              <button
                onClick={() => handleJoinConsultation(consultation)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Video className="w-4 h-4" />
                <span>Join Now</span>
              </button>
            )}
            
            {isUpcoming && !canJoin && (
              <>
                <button
                  onClick={() => handleReschedule(consultation)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={() => handleCancelConsultation(consultation.id)}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ConsultationDetails = ({ consultation, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Consultation Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={consultation.professional?.avatar || '/api/placeholder/80/80'}
                alt={consultation.professional?.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{consultation.professional?.name}</h3>
                <p className="text-blue-600 font-medium">{consultation.specialty}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">4.8 (127 reviews)</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Appointment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(consultation.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{consultation.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{consultation.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {getStatusIcon(consultation.status)}
                      <span className="capitalize">{consultation.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Consultation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation ID:</span>
                    <span className="font-medium font-mono">{consultation.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">₹{consultation.fee || 1500}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {consultation.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{consultation.notes}</p>
                </div>
              </div>
            )}

            {consultation.status === 'scheduled' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Meeting Information</h4>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Video Meeting Link</p>
                      <a 
                        href={`http://meet.wellsense.in/?room=${consultation.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        meet.wellsense.in/?room={consultation.id}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`http://meet.wellsense.in/?room=${consultation.id}`);
                          alert('Meeting link copied to clipboard!');
                        }}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleJoinConsultation(consultation)}
                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Now</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      💡 Tip: You can join the meeting 15 minutes before the scheduled time
                    </p>
                  </div>
                </div>
              </div>
            )}

            {consultation.prescription && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Prescription</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{consultation.prescription}</p>
                </div>
              </div>
            )}

            {consultation.followUp && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Follow-up Instructions</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">{consultation.followUp}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {consultation.status === 'scheduled' && (
              <button
                onClick={() => handleJoinConsultation(consultation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Consultation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const isWithinJoinWindow = (date, time) => {
    const consultationDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const timeDiff = consultationDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow joining 15 minutes before to 30 minutes after
    return minutesDiff >= -30 && minutesDiff <= 15;
  };

  const getSampleConsultations = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      {
        id: 'cons-1',
        professional: {
          name: 'Dr. Sarah Johnson',
          avatar: '/api/placeholder/60/60'
        },
        specialty: 'General Practitioner',
        date: today.toISOString().split('T')[0],
        time: '14:30',
        type: 'Video Consultation',
        status: 'scheduled',
        notes: 'Follow-up for blood pressure monitoring',
        fee: 5000
      },
      {
        id: 'cons-2',
        professional: {
          name: 'Dr. Michael Chen',
          avatar: '/api/placeholder/60/60'
        },
        specialty: 'Cardiology',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        type: 'Video Consultation',
        status: 'scheduled',
        notes: 'Cardiac health assessment',
        fee: 8000
      },
      {
        id: 'cons-3',
        professional: {
          name: 'Dr. Emily Rodriguez',
          avatar: '/api/placeholder/60/60'
        },
        specialty: 'Dermatology',
        date: '2024-01-15',
        time: '16:00',
        type: 'Video Consultation',
        status: 'completed',
        rating: 5,
        notes: 'Skin condition follow-up',
        prescription: 'Continue current medication, follow-up in 3 months',
        fee: 6500
      }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Consultations</h1>
          <p className="text-gray-600">Manage your healthcare appointments and consultations</p>
        </div>
        <button
          onClick={() => {
            console.log('Book New Consultation clicked');
            navigate('/consultation/book');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'upcoming', name: 'Upcoming', count: filteredConsultations.filter(c => c.status === 'scheduled').length },
          { id: 'completed', name: 'Completed', count: filteredConsultations.filter(c => c.status === 'completed').length },
          { id: 'cancelled', name: 'Cancelled', count: filteredConsultations.filter(c => ['cancelled', 'no_show'].includes(c.status)).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultations found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming consultations." 
              : `No ${activeTab} consultations found.`}
          </p>
          <button
            onClick={() => {
              console.log('Book Your First Consultation clicked');
              console.log('Navigate function:', navigate);
              navigate('/consultation/book');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Your First Consultation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </div>
      )}

      {/* Consultation Details Modal */}
      {showDetails && selectedConsultation && (
        <ConsultationDetails
          consultation={selectedConsultation}
          onClose={() => {
            setShowDetails(false);
            setSelectedConsultation(null);
          }}
        />
      )}
    </div>
  );
};

export default ConsultationDashboard;