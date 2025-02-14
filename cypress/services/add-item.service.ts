import { time } from "../data/timer.data";

export const addItem = (title: string, message?: string) => {
  cy.wait(time);

  const addButton = cy.get("button#add-button");
  addButton.click();

  cy.wait(time);

  const titleField = cy.get("#title-field");
  titleField.type(title);

  cy.wait(time);

  if (!!message) {
    const messageField = cy.get("#message-field");
    messageField.type(message);
  }

  const form = cy.get("form[name=manage-form]");
  form.submit();
};
