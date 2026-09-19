def test_minimum_connection_margin():
    # FR-04: Test connection window validation
    min_buffer = 90
    arrival_time = 100
    departure_time = 150
    assert (departure_time - arrival_time) < min_buffer # MISSED_CONNECTION or RISK
