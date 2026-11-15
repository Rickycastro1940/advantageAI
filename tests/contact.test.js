import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Advantage AI Solutions Contact Form", () => {
  it("navigates to contact page and fills out inquiry form", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: "https://advantageaisolutions.pro/contact" });

    const assertForm = await testdriver.assert("the contact form is visible on the page");
    expect(assertForm).toBeTruthy();

    await testdriver.find("Full name input field").click();
    await testdriver.type("Jane Doe");

    await testdriver.find("Work email input field").click();
    await testdriver.type("jane.doe@example.com");

    await testdriver.find("What would you like to automate? textarea").click();
    await testdriver.type("Automating invoice document extraction and CRM updates.");

    const assertFields = await testdriver.assert("the contact form fields are filled with Jane Doe and jane.doe@example.com");
    expect(assertFields).toBeTruthy();

    await testdriver.pressKeys(["escape"]);
    await testdriver.scroll("down", { amount: 150 });

    const assertButton = await testdriver.assert("the Send message button is visible");
    expect(assertButton).toBeTruthy();
  });
});
