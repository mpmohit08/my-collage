// app/appointments/page.tsx

import db from '@/lib/db';
import AppointmentList from '../_components/appointmentList';

export const dynamic = 'force-dynamic';

async function getAppointments() {
  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          },
        },
        doctor: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            specialties: {
              select: {
                specialty: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Transform the data to match the expected type
    return appointments.map(apt => ({
      ...apt,
      patient: {
        id: apt.patient.id,
        name: apt.patient.user?.name || 'Unknown',
        email: apt.patient.user?.email || '',
        phone: apt.patient.user?.phone || null,
      },
      doctor: {
        id: apt.doctor.id,
        name: apt.doctor.user?.name || 'Unknown',
        email: apt.doctor.user?.email || '',
        specialization: apt.doctor.specialties?.[0]?.specialty?.name || 'General',
      }
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Appointment Management
          </h1>
          <p className="text-gray-600">
            View, manage, and approve patient appointments
          </p>
        </div>

        <AppointmentList initialAppointments={appointments} />
      </div>
    </main>
  );
}

