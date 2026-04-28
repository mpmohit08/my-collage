// app/appointments/AppointmentList.tsx
'use client';

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { approveAppointment, cancelAppointment } from '../actions';

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  reason: string;
  symptoms: string[];
  notes: string | null;
  aiRecommendation: string | null;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    email: string;
  };
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
  NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-300',
};

const statusIcons = {
  PENDING: AlertCircle,
  CONFIRMED: CheckCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
  NO_SHOW: XCircle,
};

export default function AppointmentList({
  initialAppointments,
}: {
  initialAppointments: Appointment[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const result = await approveAppointment(id);
      if (result.success) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: 'CONFIRMED' as const } : apt
          )
        );
      } else {
        alert('Failed to approve appointment: ' + result.error);
      }
    });
  };

  const handleCancel = async (id: string) => {
    startTransition(async () => {
      const result = await cancelAppointment(id);
      if (result.success) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: 'CANCELLED' as const } : apt
          )
        );
      } else {
        alert('Failed to cancel appointment: ' + result.error);
      }
    });
  };

  const filteredAppointments =
    filterStatus === 'ALL'
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

  const statusCounts = {
    ALL: appointments.length,
    PENDING: appointments.filter((a) => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
  };

  return (
    <>
      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                disabled={isPending}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {status} ({statusCounts[status as keyof typeof statusCounts]})
              </button>
            )
          )}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppointments.map((appointment) => {
          const StatusIcon = statusIcons[appointment.status];
          return (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">
                      {appointment.patient.name}
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {appointment.patient.phone || appointment.patient.email}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      statusColors[appointment.status]
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <StatusIcon size={14} />
                      {appointment.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Doctor Info */}
                <div className="flex items-start gap-2">
                  <User size={18} className="text-indigo-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {appointment.doctor.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor.specialization}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium">
                      {formatDate(appointment.scheduledAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium">
                      {formatTime(appointment.scheduledAt)} (
                      {appointment.duration}min)
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex items-start gap-2">
                  <FileText size={18} className="text-indigo-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Reason
                    </p>
                    <p className="text-sm text-gray-700">
                      {appointment.reason}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">
                    Symptoms
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {appointment.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation */}
                {appointment.aiRecommendation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      AI Recommendation
                    </p>
                    <p className="text-sm text-purple-800">
                      {appointment.aiRecommendation}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {appointment.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleApprove(appointment.id)}
                      disabled={isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={18} />
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === 'CONFIRMED' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={18} />
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500">
            No appointments match the selected filter
          </p>
        </div>
      )}
    </>
  );
}

