import { Head, Link } from "@inertiajs/react";
import { BellRing, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/clinic";

interface Props {
  appointments: Appointment[];
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AppointmentsIndex({ appointments}: Props) {

}