import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Doctor} from '@/types/clinic';
import * as string_decoder from 'node:string_decoder';

interface Props {
    doctors: Doctor[];
}

const DAYS = [
    {value: 1, label: 'Mon'},
    {value: 2, label: 'Tue'},
    {value: 3, label: 'Wed'},
    {value: 4, label: 'Thu'},
    {value: 5, label: 'Fri'},
    {value: 6, label: 'Sat'},
    {value: 0, label: 'Sun'}
];

interface DayRow {
    day_of_week: number;
    enabled: boolean;
    start_time: string;
    end_time: string;
}

function buildDays(doctor?: Doctor | null): DayRow[] {
    return DAYS.map((day) => {
        const existing = doctor?.availabilities.find((a) => a.day_of_week === day.value);
        return {
            day_of_week: day.value,
            enabled: Boolean(existing),
            start_time: existing?.start_time?.slice(0, 5) ?? '09:00',
            end_time: existing?.end_time?.slice(0, 5) ?? '17:00',
        };
    });
}

function workingDaysLabel(doctor: Doctor): string {
    const labels = DAYS.filter((day) => doctor.availabilities.some((a) => a.day_of_week === day.value)).map((d) => d.label);
    return labels.length ? labels.join(', ') : '—';
}

export default function DoctorsIndex({ doctors }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Doctor | null>(null);

    const form = useForm<{ name: string; specialty: string; bio: string; days: DayRow[] }>({
        name: '',
        specialty: '',
        bio: '',
        days: buildDays(null),
    });

    function openCreate() {
        setEditing(null);
        form.setData({ name: '', specialty: '', bio: '', days: buildDays(null) });
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(doctor: Doctor) {
        setEditing(doctor);
        form.setData({
            name: doctor.name,
            specialty: doctor.specialty,
            bio: doctor.bio ?? '',
            days: buildDays(doctor),
        });
        form.clearErrors();
        setOpen(true);
    }

    function updateDay(index: number, patch: Partial<DayRow>) {
        form.setData(
            'days',
            form.data.days.map((day, i) => (i === index ? { ...day, ...patch } : day)),
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        form.transform((data) => ({
            name: data.name,
            specialty: data.specialty,
            bio: data.bio,
            availabilities: data.days
                .filter((day) => day.enabled)
                .map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time })),
        }));

        const options = {
            onSuccess: () => {
                toast.success(editing ? 'Doctor updated.' : 'Doctor added.');
                setOpen(false);
            },
        };

        if (editing) {
            form.put(`/admin/doctors/${editing.id}`, options);
        } else {
            form.post('/admin/doctors', options);
        }
    }

    function destroy(doctor: Doctor) {
        if (! confirm(`Delete ${doctor.name}? This also removes teir appointments.`)) return;
        router.delete(`/admin/doctors/${doctor.id}`, {
            onSuccess: () => toast.success('Doctor removed')
        });
    }

    return (
        <>
            <Head title="Manage Doctors" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Doctors</h1>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" /> Add Doctor
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-sm">
                        <thead className=''>

                        </thead>
                    </table>
                </div>

            </div>
        </>
    );
}