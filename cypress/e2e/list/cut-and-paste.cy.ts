import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("List -- cut and paste", () => {
  it("should cut item", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    const cutButton = cy
      .get("#list > li")
      .first()
      .find(".list-page__item-button")
      .eq(1);
    cutButton.click();

    cy.wait(time);

    // ** Assert
    {
      const pasteItemButton = cy.get("button#paste-item-button");
      pasteItemButton.should("exist");
      const items = cy.get("#list > li");
      items.should("have.length", 0);
    }

    // ** Act
    {
      const pasteItemButton = cy.get("button#paste-item-button");
      pasteItemButton.click();
    }

    // ** Assert
    const items = cy.get("#list > li");
    items.should("have.length", 1);
  });
});
