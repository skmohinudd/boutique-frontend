const steps = ["Cart", "Shipping", "Payment", "Confirmation"];

export default function CheckoutStepper({ active }) {
  const activeIndex = steps.indexOf(active);
  return (
    <ol className="checkout-stepper" aria-label="Checkout progress">
      {steps.map((step, index) => (
        <li
          key={step}
          className={index < activeIndex ? "complete" : index === activeIndex ? "active" : ""}
        >
          <span>{index < activeIndex ? "✓" : index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
