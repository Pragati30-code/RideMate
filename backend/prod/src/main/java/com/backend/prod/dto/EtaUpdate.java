package com.backend.prod.dto;

public class EtaUpdate {

    private Long etaSeconds;
    private Long distanceM;

    public EtaUpdate() {}

    public EtaUpdate(Long etaSeconds, Long distanceM) {
        this.etaSeconds = etaSeconds;
        this.distanceM = distanceM;
    }

    public Long getEtaSeconds() {
        return etaSeconds;
    }

    public void setEtaSeconds(Long etaSeconds) {
        this.etaSeconds = etaSeconds;
    }

    public Long getDistanceM() {
        return distanceM;
    }

    public void setDistanceM(Long distanceM) {
        this.distanceM = distanceM;
    }
}
