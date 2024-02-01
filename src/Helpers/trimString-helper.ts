const trimStringProperties = async(obj: any):Promise<any> => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => trimStringProperties(item)));
    }

    return Promise.all(
        Object.keys(obj).map(async (key) => {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object') {
                obj[key] = await trimStringProperties(obj[key]);
            }
        })
    ).then(() => obj);
};

export{trimStringProperties};