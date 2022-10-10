export const formatDateAndTime = (date, options, lang='en-US') => {
    const dateObj = new Date(date);
    const dateFormat = new Intl.DateTimeFormat(lang, options).format(dateObj);
    
    return dateFormat;
}