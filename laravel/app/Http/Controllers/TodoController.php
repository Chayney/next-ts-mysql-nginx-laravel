<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Todo;

class TodoController extends Controller
{
    public function index()
    {
        return Todo::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:255',
        ]);

        $todo = Todo::create([
            'text' => $validated['text'],
            'completed' => false,
            'user_id' => auth()->id(),
        ]);

        return response()->json($todo, 201);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:todos,id',
            'text' => 'required|string|max:255',
            'completed' => 'required|boolean',
        ]);

        $todo = Todo::where('id', $validated['id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $todo->update([
            'text' => $validated['text'],
            'completed' => $validated['completed'],
        ]);

        return response()->json($todo);
    }

    public function edit($id)
    {
        $todo = Todo::where('id', $id)->where('user_id', auth()->id())->firstOrFail();

        return response()->json($todo);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:todos,id',
        ]);

        $todo = Todo::where('id', $validated['id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $todo->delete();

        return response()->json(['message' => 'Todo deleted']);
    }
}
