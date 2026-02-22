* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background: #0f1115;
    color: #e5e7eb;
}

/* Layout */

.layout {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */

.sidebar {
    width: 240px;
    background: #16181d;
    border-right: 1px solid #222;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px;
}

.brand {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 32px;
}

.sidebar nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sidebar nav a {
    padding: 10px 12px;
    border-radius: 8px;
    color: #9ca3af;
    cursor: pointer;
    transition: 0.2s;
}

.sidebar nav a:hover {
    background: #22252b;
    color: white;
}

.sidebar nav a.active {
    background: #1f2937;
    color: white;
}

.sidebar nav a.management {
    color: #fbbf24;
}

.user {
    margin-top: 40px;
}

.user span {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
}

.user button {
    width: 100%;
    padding: 8px;
    background: #dc2626;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
}

.user button:hover {
    background: #b91c1c;
}

/* Content */

.content {
    flex: 1;
    padding: 40px;
}

.topbar {
    margin-bottom: 40px;
}

.topbar h1 {
    font-size: 24px;
}

/* Grid */

.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.card {
    background: #1a1c21;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 24px;
    transition: 0.2s;
}

.card:hover {
    border-color: #333;
}

.card.large {
    grid-column: span 2;
}

.card.small {
    text-align: center;
}

.card.small h3 {
    font-size: 28px;
    margin-bottom: 6px;
}

.management-card {
    border: 1px solid #fbbf24;
}

.management-card:hover {
    border-color: #facc15;
}

/* Responsive */

@media (max-width: 1000px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .card.large {
        grid-column: span 1;
    }
}
