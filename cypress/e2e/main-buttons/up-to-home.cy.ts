import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("Main Buttons -- up to root", () => {
  it("should add item and a sub item", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle1 = "goose";
    const itemTitle2 = "plum";

    // ** Act
    addItem(itemTitle1);

    cy.wait(time);

    const items = cy.get("#list > li");
    const first = items.first();
    first.click();

    cy.wait(time);

    addItem(itemTitle2);

    cy.wait(time);

    const upToRoot = cy.get("#up-to-root");
    upToRoot.click();

    cy.wait(time);

    // ** Assert
    {
      cy.location("hash").should("eq", "#list");
      const first = cy.get("#list li").first();
      first.should("include.text", itemTitle1);
    }
  });
});
