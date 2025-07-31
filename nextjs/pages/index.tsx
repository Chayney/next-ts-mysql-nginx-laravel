import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User } from '../types/user';
import { Todo } from '../types/todo';
// import styles from '../styles/todo.module.css';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [todoText, setTodoText] = useState('');
  const [inCompleteTodos, setIncompleteTodos] = useState<Todo[]>([]);
  const [completeTodos, setCompleteTodos] = useState<Todo[]>([]);

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
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost/api/user', {
          credentials: 'include',
        });
        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
    fetchUser();
  }, [router]);

  const fetchTodos = async () => {
    const res = await fetch('http://localhost/api/todos', {
      credentials: 'include',
    });
    const data: Todo[] = await res.json();
    setIncompleteTodos(data.filter(todo => !todo.completed));
    setCompleteTodos(data.filter(todo => todo.completed));
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    setTodoText(event.target.value);
  };

  const onClickAdd = async () => {
    if (todoText === '') return;
    await fetchWithCsrf('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: todoText }),
    });
    setTodoText('');
    await fetchTodos();
  };

  const onClickComplete = async (todo: Todo) => {
    const updatedTodo = { ...todo, completed: true };
    const res = await fetchWithCsrf('http://localhost/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTodo),
    });
    if (res.ok) {
      setIncompleteTodos(prev => prev.filter(t => t.id !== todo.id));
      setCompleteTodos(prev => [...prev, updatedTodo]);
    }
  };

  const onClickBack = async (todo: Todo) => {
    const updatedTodo = { ...todo, completed: false };
    const res = await fetchWithCsrf('http://localhost/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTodo),
    });
    if (res.ok) {
      setCompleteTodos(prev => prev.filter(t => t.id !== todo.id));
      setIncompleteTodos(prev => [...prev, updatedTodo]);
    }
  };

  const onClickDelete = async (id: number) => {
    await fetchWithCsrf(`http://localhost/api/todos?id=${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  };

  const logout = async () => {
    await fetch('http://localhost/sanctum/csrf-cookie', {
      credentials: 'include',
    });

    const xsrfToken = getXsrfToken();

    await fetch('http://localhost/api/logout', {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': xsrfToken ?? '',
      },
      credentials: 'include',
    });

    router.push('/login');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <div className="header">
        <h1>Welcome {user.name}</h1>
        <button className="logout" onClick={logout}>ログアウト</button>
      </div>
      <div className="input-area">
        <input placeholder="Todoを入力" value={todoText} onChange={onChangeText} />
        <button onClick={onClickAdd}>追加</button>
      </div>
      <div className="incomplete-area">
        <p className="title">未完了のTodo</p>
        <ul>
          {inCompleteTodos.map(todo => (
            <li key={todo.id}>
              <div className="list-row">
                <p className="todo-item">{todo.text}</p>
                <button onClick={() => onClickComplete(todo)}>完了</button>
                <Link href={`/edit/${todo.id}`}>
                  <button>編集</button>
                </Link>
                <button onClick={() => onClickDelete(todo.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="complete-area">
        <p className="title">完了のTodo</p>
        <ul>
          {completeTodos.map(todo => (
            <li key={todo.id}>
              <div className="list-row">
                <p className="todo-item">{todo.text}</p>
                <button onClick={() => onClickBack(todo)}>戻す</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
