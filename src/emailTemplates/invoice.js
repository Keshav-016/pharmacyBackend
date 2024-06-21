const createInvoice = ({ user, medicine, pharmacist, order, price }) => {
    const totalPrice = () => {
        return medicine
            ?.reduce((acc, curr) => {
                return (
                    acc + curr?.medicineId?.price * curr.quantity
                );
            }, 0)
            .toFixed(2)
    }
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];

    const dateView = () => {
        const date = new Date();
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hour = date.getHours();
        const convertedHour = hour > 12 ? hour - 12 : hour;
        const minutes = date.getMinutes();

        return `${month} ${day}, ${year} `;
    };
    return `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #1ecbe1; ">


    <div
        style=" max-width: 600px; margin: 20px auto; border: 1px solid #ddd; ">

        <div style=" display: flex; justify-content: space-between; text-align: center; background-color: #adb8ef57; font-size: 1.5rem;">
            <div style="padding: 1%; color: #174883; display: flex; align-items: center; ">
                <div style="font-weight: bold; display:flex; align-items:center;">medigen</div>
            </div>
            <div
                style="background-color: #174883; height: 4rem; width: 12rem; border-radius: 40px 0px 0px 40px; color: #fff;">
                <h3 style="margin: 0px; padding: 1px; font-weight: bold; font-size: 1rem;">Invoice</h3>
                <h6 style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.6rem;">Invoice Number: INV-${order?._id}</h6>
                <h6 style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.6rem;">Invoice Date:${dateView()}</h6>
            </div>

        </div>


        <div style="padding: 5px;">
            <div style="display: flex; justify-content: space-between;">
                <div style="margin-bottom: 20px;">
                    <p style="color: #174883; font-weight: bold; font-size: 1rem; margin: 0px; padding: 1px; line-height: 2rem;">Invoice From:</p>
                    <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">medigen</p>
                    <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">Kolkata, Sector-5</p>
                    <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">Kolkata, West Bengal</p>
                    <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">Email: medigen.com</p>
                </div>
                <div>
                    <div style="margin-bottom: 20px;">
                        <p style="color: #174883;font-weight: bold; font-size: 1rem; margin: 0px; padding: 1px; line-height: 2rem;">Invoice To:</p>
                        <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">${user?.name}</p>
                        <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">${order?.address?.area}</p>
                        <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">${order?.address?.city}</p>
                        <p style="margin: 0px; padding: 1px; font-weight: lighter; font-size: 0.7rem; line-height: 0.7rem;">Email:${user?.email}</p>
                    </div>

                    <div style="margin-bottom: 20px;">

                    </div>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin: auto;">
                <thead style="border-radius: 10px;">
                    <tr>
                        <th style="border: 1px solid #ddd; color: #fff;  padding: 8px; background-color: #174883; text-align: left; font-size: 0.9rem;">
                            Description</th>
                        <th style="border: 1px solid #ddd; color: #fff; padding: 8px; background-color: #174883; text-align: left; font-size: 0.9rem;">
                            Quantity</th>
                        <th style="border: 1px solid #ddd; color: #fff; padding: 8px; background-color: #174883; text-align: left; font-size: 0.9rem;">
                            Price</th>
                        <th style="border: 1px solid #ddd; color: #fff; padding: 8px; background-color: #174883; text-align: left; font-size: 0.9rem;">
                            Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${medicine.map((item, ind) => {
        return (
            `
                                <tr>
                                    <td style="font-size: 0.8rem;  border: 1px solid #ddd; padding: 8px;">${item?.medicineId?.name}</td>
                                    <td style="font-size: 0.8rem;  border: 1px solid #ddd; padding: 8px; text-align: left;">${item?.quantity}</td>
                                    <td style="font-size: 0.8rem;  border: 1px solid #ddd; padding: 8px; text-align: left;"> ${parseFloat(item?.medicineId?.price).toFixed(2)}</td>
                                    <td style="font-size: 0.8rem;  border: 1px solid #ddd; padding: 8px; text-align: left;">${item?.quantity * item?.medicineId?.price}</td>
                                </tr>
                                `
        )
    })
        }
                </tbody>
                <tfoot>
                <tr>
                    <td colspan="3" style=" font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">
                       Subtotal
                    </td>
                    <td style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left;">₹ ${totalPrice()}</td>
                </tr>
                    <tr>
                        <td colspan="3" style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">Delivery Charges
                        </td>
                        <td style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left;">₹50.00</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">Handling Charges
                        </td>
                        <td style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left;">₹50.00</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">Discount
                        (${((totalPrice() + 100 - price) / totalPrice() * 100).toFixed(2)}%)</td>
                        <td style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left;">₹ ${(totalPrice() + 100 - price).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">
                            Total
                        </td>
                        <td style="font-size: 0.9rem; border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 550;">₹ ${price}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="text-align: center; margin: 40px 0px 20px 0px;">
                <p style="color: #174883; margin: 0px; padding: 1px; font-size: 0.8rem;">Payment Methods:</p>
                <p style="margin: 0px; padding: 0px; line-height:1rem; font-size: 0.7rem;">Bank Transfer, Credit Card, PayPal</p>
            </div>

            <div style="text-align: center;">
             
                
                <p><a href="mailto:yourcompany@example.com"style=" color: #174883; text-decoration: none; font-weight: bold;">medigen.com</a>
                </p>
            </div>
        </div>
    </div>

</div>`

}

export default createInvoice