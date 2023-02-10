beforeEach(() => {
  cy.visit("/");
});

describe("Check components on first page", () => {
  it("should display all components", () => {
    cy.get("input").should("exist").and("be.visible");
    cy.get("button").contains("Sök").should("exist").and("be.visible");
  });
});

describe("Input field", () => {
  it("should allow text input", () => {
    cy.get("input")
      .type("Inception")
      .should("have.value", "Inception");
  });

  it("should display a message when no search results", () => {
    cy.get("input")
      .type(" ")
      .should("have.value", " ");
    cy.get("button").click();

    cy.get("#movie-container > p").should("be.visible");
    cy.get("p").contains("Inga sökresultat att visa").should("exist");
  });
});

describe("Test real API", () => {
  it("should return correct movies", () => {
    cy.get("input")
      .type("Shrek")
      .should("have.value", "Shrek");
    cy.get("button").click();

    cy.get("#movie-container").should("exist").and("be.visible");
    cy.get(".movie > h3").should("exist").and("be.visible");
    cy.get(".movie > img").should("exist").and("be.visible");
    cy.get("h3").contains("Shrek").should("exist").and("be.visible");
    cy.get(".movie").should("have.length", 10);
  });
});

describe("Correct HTML display", () => {
  it("should display a div, h3, and img", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", { fixture: "omdbResponse" }).as(
      "omdbCall"
    );
    cy.get("input")
      .type("Inception")
      .should("have.value", "Inception");
    cy.get("button").click();
    cy.wait("@omdbCall");

    cy.get("#movie-container").should("exist").and("be.visible");
    cy.get(".movie > h3").should("exist").and("be.visible");
    cy.get(".movie > img").should("exist").and("be.visible");
    cy.get("h3").contains("Inception").should("exist").and("be.visible");
  });
});

describe("Mock Data Tests", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", { fixture: "omdbResponse" }).as("omdbCall");
  });

  it("should get mock data", () => {
    cy.get("input").type("Shutter Island");
    cy.get("button").click();
    cy.wait("@omdbCall");

    cy.get("h3").contains("Shutter Island").should("exist");
    cy.get("h3").filter(':contains("Shutter Island")').should("have.length", 1);
  });

  it("should get mock data with correct URL", () => {
    cy.get("input").type("Inception");
    cy.get("button").click();

    cy.wait("@omdbCall").its("request.url").should("contain", "Inception");
  });
});

describe("Error Tests", () => {
  it("should get error", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", { fixture: "emptyResponse" }).as("emptyomdbCall");

    cy.get("input").type("Inception");
    cy.get("button").click();
    cy.wait("@emptyomdbCall");

    cy.get("#movie-container > p").should("be.visible");
    cy.get("p").contains("Inga sökresultat att visa").should("exist");
    cy.get(".movie").should("not.exist");
  });
});