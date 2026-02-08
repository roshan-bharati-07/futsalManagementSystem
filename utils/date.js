export function findTommorowAndAfterDate() {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const hour = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
    // add AM PM 
    const currentHour = `${hour >= 12 ? "PM" : "AM"}`;

    const tommorow = new Date(today);
    tommorow.setDate(tommorow.getDate() + 1);
    const tommorowDate = tommorow.toISOString().split("T")[0];

    const afterDate = new Date(today);
    afterDate.setDate(afterDate.getDate() + 2);
    const afterTommorowDate = afterDate.toISOString().split("T")[0];

    return {
        todayDate,
        tommorowDate,
        afterTommorowDate,
        currentHour
    }
}
