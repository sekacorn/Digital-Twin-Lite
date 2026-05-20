import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InputForm from "./InputForm";

describe("InputForm", () => {
  it("exposes the extended projection periods", () => {
    render(<InputForm onSubmit={() => {}} loading={false} />);

    const period = screen.getByLabelText("Period");

    expect(period).toHaveDisplayValue("30 DAYS");
    for (const label of ["7 DAYS", "14 DAYS", "30 DAYS", "90 DAYS", "120 DAYS", "180 DAYS"]) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("submits a custom scenario when enabled", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InputForm onSubmit={onSubmit} loading={false} />);

    await user.click(screen.getByLabelText("Add Custom Scenario"));
    await user.clear(screen.getByLabelText("Scenario Name"));
    await user.type(screen.getByLabelText("Scenario Name"), "Balanced Plan");
    await user.clear(screen.getByLabelText("Custom Calories"));
    await user.type(screen.getByLabelText("Custom Calories"), "1900");
    await user.clear(screen.getByLabelText("Custom Maintenance"));
    await user.type(screen.getByLabelText("Custom Maintenance"), "2300");
    await user.click(screen.getByRole("button", { name: "[ RUN SIMULATION ]" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        calories: 2000,
        maintenance_calories: 2000,
      }),
      30,
      {
        label: "Balanced Plan",
        habits: expect.objectContaining({
          calories: 1900,
          maintenance_calories: 2300,
          current_weight: 80,
        }),
      },
    );
  });

  it("shows non-blocking cautions for unusual inputs", async () => {
    const user = userEvent.setup();
    render(<InputForm onSubmit={() => {}} loading={false} />);

    await user.clear(screen.getByLabelText("Calories Eaten"));
    await user.type(screen.getByLabelText("Calories Eaten"), "900");
    await user.clear(screen.getByLabelText("Exercise (min)"));
    await user.type(screen.getByLabelText("Exercise (min)"), "240");

    expect(screen.getByText("Input Cautions")).toBeInTheDocument();
    expect(screen.getByText("Very low calorie intake can be unsafe for many people.")).toBeInTheDocument();
    expect(screen.getByText("Very high daily exercise may make projections less representative.")).toBeInTheDocument();
  });
});
