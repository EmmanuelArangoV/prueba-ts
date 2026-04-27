async function refreshToken(): Promise<boolean> {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
}

export async function fetcher<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    let res = await fetch(url, options);

    if (res.status === 401) {
        const refreshed = await refreshToken();

        if (!refreshed) {
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
            throw new Error("Sesión expirada");
        }

        res = await fetch(url, options);
    }

    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data as T;
}