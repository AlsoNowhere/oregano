import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("List -- Add sub item", () => {
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

    // ** Assert
    {
      cy.location("hash").should("eq", "#list/0");
      const first = cy.get("#list li").first();
      first.should("include.text", itemTitle2);
    }
  });
});
