import { time } from "../../data/timer.data";

describe("Manage -- Edit message", () => {
  it("should edit the item message", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemMessage = "goose";
    const newMessage = "lemon";

    // ** Act
    cy.wait(time);

    const addButton = cy.get("button#add-button");
    addButton.click();

    {
      cy.wait(time);

      const titleField = cy.get("#title-field");
      titleField.type("title");

      cy.wait(time);

      const messageField = cy.get("#message-field");
      messageField.type(itemMessage);

      cy.wait(time);

      const form = cy.get("form[name=manage-form]");
      form.submit();
    }

    {
      cy.wait(time);

      const items = cy.get("#list > li");
      const first = items.first();
      const itemsButtons = first.find(".list-page__item-button");
      const editButton = itemsButtons.first();
      editButton.click();
    }

    {
      cy.wait(time);

      const messageField = cy.get("#message-field");
      messageField.clear();
      messageField.type(newMessage);

      cy.wait(time);

      const form = cy.get("form[name=manage-form]");
      form.submit();
    }

    cy.wait(time);

    // ** Assert
    const messageElement = cy.get(".list-page__message > p");
    messageElement.should("include.text", newMessage);
  });
});
