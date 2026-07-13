package com.falcim.reading;

import com.falcim.common.BaseEntity;
import com.falcim.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

/**
 * Tek bir okuma (fal) kaydı. Kategori sayesinde kahve/tarot/burç/natal aynı tabloda tutulur.
 */
@Entity
@Table(name = "readings")
public class Reading extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReadingCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Intent intent;

    @Column(name = "result_text", nullable = false, columnDefinition = "text")
    private String resultText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "symbols", nullable = false, columnDefinition = "jsonb")
    private List<ReadingSymbol> symbols = List.of();

    @Column(name = "energy_pct", nullable = false)
    private int energyPct;

    @Column(name = "image_ref")
    private String imageRef;

    protected Reading() {
    }

    public Reading(User user, ReadingCategory category, Intent intent,
                   String resultText, List<ReadingSymbol> symbols, int energyPct) {
        this.user = user;
        this.category = category;
        this.intent = intent;
        this.resultText = resultText;
        this.symbols = symbols == null ? List.of() : symbols;
        this.energyPct = energyPct;
    }

    public User getUser() {
        return user;
    }

    public ReadingCategory getCategory() {
        return category;
    }

    public Intent getIntent() {
        return intent;
    }

    public String getResultText() {
        return resultText;
    }

    public List<ReadingSymbol> getSymbols() {
        return symbols;
    }

    public int getEnergyPct() {
        return energyPct;
    }

    public String getImageRef() {
        return imageRef;
    }

    public void setImageRef(String imageRef) {
        this.imageRef = imageRef;
    }
}
