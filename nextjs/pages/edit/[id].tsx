import { Todo } from '../../types/todo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function EditPage() {
    const router = useRouter();
    const { id } = router.query;

    const [text, setText] = useState('');
    const [todo, setTodo] = useState<Todo | null>(null);

    // XSRFトークン取得
    const getXsrfToken = (): string | null => {
        const name = 'XSRF-TOKEN';
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? decodeURIComponent(match[2]) : null;
    };

    const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
        await fetch('http://localhost/sanctum/csrf-cookie', {
            credentials: 'include',
        });
        const xsrfToken = getXsrfToken();
        return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
                'X-XSRF-TOKEN': xsrfToken ?? '',
            },
        });
    };

    useEffect(() => {
        if (!id) return;
        const todoId = Number(id);

        const fetchTodo = async () => {
            try {
                const res = await fetch(`http://localhost/api/todos/${todoId}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Todo fetch failed');
                }
                const data: Todo = await res.json();
                setTodo(data);
                setText(data.text);
            } catch (error) {
                console.error('Error fetching todo:', error);
                alert('Todoの取得に失敗しました');
            }
        };
        fetchTodo();
    }, [id]);

    const onClickEdit = async () => {
        if (text === '' || !todo) return;
        try {
            const res = await fetchWithCsrf('http://localhost/api/todos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken() ?? '',
                },
                body: JSON.stringify({ id: todo.id, text: text, completed: false })
            });

            if (!res.ok) {
                throw new Error('Update failed');
            }

            router.push('/');
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Todoの更新に失敗しました');
        }
    };

    return (
        <div className="input-area">
            <input
                placeholder="Todoを入力"
                value={text}
                onChange={(event) => setText(event.target.value)}
            />
            <button onClick={onClickEdit}>完了</button>
        </div>
    );
}
