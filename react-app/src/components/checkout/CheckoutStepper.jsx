import { Check } from "lucide-react";
const steps = ["Cart", "Shipping", "Payment", "Confirmation"];
export default function CheckoutStepper({ active }) {
  const index = steps.indexOf(active);
  return (
    <ol className="checkout-stepper" aria-label="Checkout progress">
      {steps.map((step, i) => (
        <li
          className={i < index ? "done" : i === index ? "active" : ""}
          key={step}
        >
          <span>{i < index ? <Check size={15} /> : i + 1}</span>
          <b>{step}</b>
        </li>
      ))}
    </ol>
  );
}
