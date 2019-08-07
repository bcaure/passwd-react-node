export default function authHeader(token, options) {
    const authHeader = { 'Authorization': token };
    if (options) {
        if (options.headers) {
            options.headers = { ...options.headers, ...authHeader };
        } else {
            options.headers = authHeader;
        }
    } else {
        options = { headers: authHeader }
    }
    return options;
}