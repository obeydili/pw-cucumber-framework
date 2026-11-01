@hybrid @as-trader
Feature: Order Approval (Hybrid)

  Scenario: Trader sees approved status after a backend approval
    Given I have placed a new limit buy order
    When the order is approved via API
    And I reload the page
    Then the order status should be "Approved"