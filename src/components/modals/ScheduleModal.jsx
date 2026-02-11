import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Stethoscope, Save } from 'lucide-react';

const ScheduleModal = ({ isOpen, onClose }) => {
  const [appointment, setAppointment] = useState({
    type: 'consultation',
    date: '',
    time: '',
    doctor: '',
    notes: '',
    priority: 'normal'
  });
  const [isSaving, setIsSaving] = useState(false);

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation', icon: '👩‍⚕️' },
    { value: 'checkup', label: 'Health Checkup', icon: '🩺' },
    { value: 'specialist', label: 'Specialist Visit', icon: '🏥' },
    { value: 'therapy', label: 'Therapy Session', icon: '🧠' },
    { value: 'dental', label: 'Dental Care', icon: '🦷' },
    { value: 'eye', label: 'Eye Examination', icon: '👁️' }
  ];

  const doctors = [
    'Dr. Sarah Johnson - General Practitioner',
    'Dr. Michael Chen - Cardiologist',
    'Dr. Emily Davis - Dermatologist',
    'Dr. Robert Wilson - Neurologist',
    'Dr. Lisa Brown - Psychiatrist',
    'Dr. James Miller - Orthopedist'
  ];

  const handleInputChange = (e) => {
    setAppointment({
      ...appointment,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage for demo
    const existingAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    existingAppointments.push(newAppointment);
    localStorage.setItem('userAppointments', JSON.stringify(existingAppointments));
    
    setIsSaving(false);
    onClose();
    
    // Reset form
    setAppointment({
      type: 'consultation',
      date: '',
      time: '',
      doctor: '',
      notes: '',
      priority: 'normal'
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Appointment</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {appointmentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAppointment({ ...appointment, type: type.value })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        appointment.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={appointment.date}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    name="time"
                    value={appointment.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Doctor
                </label>
                <select
                  name="doctor"
                  value={appointment.doctor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' },
                    { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
                    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setAppointment({ ...appointment, priority: priority.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        appointment.priority === priority.value
                          ? priority.color
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={appointment.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !appointment.date || !appointment.time}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Schedule</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleModal;