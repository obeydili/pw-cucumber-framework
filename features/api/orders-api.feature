@api @as-trader
Feature: Orders API

Scenario: Create and retrieve an order
    When I create a valid order via API
    Then the API response should be 201 Created
    When I retrieve the created order via API
    Then the retrieved order details should be correct

Scenario: Cannot create an order with invalid data
    When I attempt to create an order with invalid data via API
    Then the API response should be 400 Bad Request
    And the API response body should contain the invalid quantity error

  Scenario: Trader cannot approve an order
    Given I have an existing order created via API
    When I attempt to approve the order via API
    Then the API response should be 403 Forbidden
    And the API response body should contain the forbidden error