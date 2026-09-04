<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('appointment:send-reminder')]
#[Description('Email reminders for opted-in appointments happening in the next 24 hours.')]
class SendAppointmentReminder extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $appointments = Appointment::query()
            ->with('doctor')
            ->where('reminder_opt_in', true)
            ->whereNull('reminder_sent_at')
            ->whereBetween('scheduled_at', [now(), now()->addDay()])
            ->get();

        foreach ( $appointments as $appointment ) {
            Mail::to($appointment->patient_email)->send(new AppointmentReminderMail($appointment));

            $appointment->update(['reminder_sent_at' => now()]);

            $this->info("Reminder sent for Appointment #{$appointment->id} ({$appointment->patient_email}). ");
        }

        $this->info($appointments->count() . " reminder(s) sent.");

        return self::SUCCESS;
    }
}
