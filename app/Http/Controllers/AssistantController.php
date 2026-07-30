<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AppointmentAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('assistant/index');
    }

    public function message(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['required', 'string'],
        ]);

        $assistant = new AppointmentAssistant;

        if ($validated['conversation_id']) {
            $assistant->continue($validated['conversation_id'], as: $request->user() );
        }
        else {
            $assistant->forUser($request->user());
        }

        $response = $assistant->prompt($validated['message']);
        
        return response()->json([
            'reply' => (string) $response,
            'conversation_id' => $response->conversationId
        ]);
    }
}
