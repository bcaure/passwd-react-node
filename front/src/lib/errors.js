// Factorize error management
export function processHttpStatus(response) {
    if (!response.ok) {
        throw response;
    }
    return response.json();
}
export function manageError(error) {
    let errorToProcess = error;
    if (error.json) {
        return error.json().then(json => processPromiseError(json));
    } else {
        return Promise.resolve(error);
    }
}

function processPromiseError(error) {
    let toDisplay = '';
    let toLog = '';
    if (error.message) {
        toDisplay = error.message;
        toLog = error.message;
    }
    console.error(toLog);
    return Promise.resolve(toDisplay);
}

