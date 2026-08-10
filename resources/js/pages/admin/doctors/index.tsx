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