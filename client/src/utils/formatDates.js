export const formatDates = (date) => {
    //convert 2022-09-17 to 17 Sept 2022
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
};

export const formatDateAndTime = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const time = dateObj.toLocaleTimeString()
    return `${day} ${month} ${year} - ${time}`;
}