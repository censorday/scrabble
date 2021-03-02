var Tesseract = window.Tesseract;

export const generateText = (imageString, isPuzzle) => {
    let patterns = [];
    const result = Tesseract.recognize(imageString, {
    lang: "eng",
    });
    patterns = Promise.all([result]).then((values) => {
        if (values.length > 0){
            let data = [];
            const tempText = values[0].text;
            console.log('tempText', tempText);
            if (isPuzzle) {
                const pattern = /\b\w{10,10}\b/g;
                data = tempText.match(pattern);
            } else {
                let pattern = /[0-9]+/g;
                data = tempText.replace(pattern, " ");
                pattern = /[”“\n_-]+/g;
                data = tempText.replace(pattern, " ");
                data = data.split(" ");
                data = data.filter((item) => {
                    if (item.length > 2)
                        return item.trim();
                })
            }
            return data;
        }
    })
    return patterns;
};