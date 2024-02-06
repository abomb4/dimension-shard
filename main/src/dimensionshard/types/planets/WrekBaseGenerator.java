package dimensionshard.types.planets;

import arc.func.Cons;
import arc.func.Intc2;
import arc.math.Angles;
import arc.math.Mathf;
import arc.math.geom.Geometry;
import arc.math.geom.Point2;
import arc.math.geom.Vec2;
import arc.struct.Seq;
import arc.util.Nullable;
import arc.util.Tmp;
import dimensionshard.DsBlocks;
import mindustry.Vars;
import mindustry.ai.Astar;
import mindustry.ai.BaseRegistry;
import mindustry.ai.BaseRegistry.BasePart;
import mindustry.content.Blocks;
import mindustry.ctype.Content;
import mindustry.entities.TargetPriority;
import mindustry.game.Schematic;
import mindustry.game.Schematic.Stile;
import mindustry.game.Schematics;
import mindustry.game.Team;
import mindustry.gen.Building;
import mindustry.type.Item;
import mindustry.type.Sector;
import mindustry.world.Block;
import mindustry.world.Tile;
import mindustry.world.Tiles;
import mindustry.world.blocks.defense.Wall;
import mindustry.world.blocks.logic.LogicBlock;
import mindustry.world.blocks.payloads.PayloadBlock;
import mindustry.world.blocks.payloads.PayloadConveyor;
import mindustry.world.blocks.power.PowerNode;
import mindustry.world.blocks.production.Drill;
import mindustry.world.blocks.production.Pump;
import mindustry.world.blocks.sandbox.ItemSource;
import mindustry.world.blocks.storage.CoreBlock;
import mindustry.world.meta.BuildVisibility;

import static mindustry.Vars.bases;
import static mindustry.Vars.content;
import static mindustry.Vars.state;
import static mindustry.Vars.world;

/**
 * Copied from BaseGenerator, adjust core schematics
 *
 * @author abomb4 2023-08-06
 */
public class WrekBaseGenerator {

    /** 04 */
    private static final int MIN_WALL_DIFFICULTY = 4;
    /** Walls available, no other mods */
    private static final Wall[] AVAILABLE_WALLS = new Wall[]{
        // 04
        (Wall) Blocks.titaniumWall,
        // 05
        (Wall) Blocks.thoriumWall,
        // 06
        (Wall) Blocks.phaseWall,
        // 07
        (Wall) Blocks.surgeWall,
        // 08
        DsBlocks.shardWall,
        // 09
        DsBlocks.hardThoriumAlloyWall,
    };

    /** Walls available, no other mods */
    private static final Wall[] AVAILABLE_WALLS_LARGE = new Wall[]{
        // 04
        (Wall) Blocks.titaniumWallLarge,
        // 05
        (Wall) Blocks.thoriumWallLarge,
        // 06
        (Wall) Blocks.phaseWallLarge,
        // 07
        (Wall) Blocks.surgeWallLarge,
        // 08
        DsBlocks.shardWallLarge,
        // 09
        DsBlocks.hardThoriumAlloyWallLarge,
    };

    private final Seq<BasePart> parts = new Seq<>();
    // @formatter:off
    // Dimension Enemy Base Small
    public final BasePart deBaseSmall = createPart(Schematics.readBase64("bXNjaAF4nF1PyU7DMBB9NM7eVpyQgAO9Ix/5AQRfwBFxcJJRWuTY0SQF5dtZyjilQiJR/OYtM55gjWUE5UxHuHrYdeSGnXebR0fdtLk3A22eOmMtyoaGmnf9KC6AxJqK7IDF80uJtXQ1umf/SvXoGTfNaY4etoYbXfmu0iNZ6j2PxEjY7wOueGx1S47YhL5zw51nanTt3RtNomR7Z71pJHr7f+YfH6neOm99O0kjk75DOvSyCROK3r8Ta+cbwqoyo1w6aWu4JaS/VH7mWj4ozE8KnMlbAAuBBItIChXsxYmlwYuERUogD6I6RtQxokIksNmLJS1HjCQGSlHjoCfIJBxU5KKvpUoRSXUpmMvV4mfIs+jwefiGOnwJfohRhNWKeY6ElscZJTLpvJD1l7LRDBnwA3mkY4A="));
    // DE Square Defence
    public final BasePart deSquareDefence =  createPart(Schematics.readBase64("bXNjaAF4nHVSwZLTMAxVkzSNk82WvXBlbwzD+MgfLAfOHBkObqJty6RxcFKYfg0fyB8AS3iSp1tmZ7at/Szp6UmWSzdUp5T17sB0c/f+9uPXowt8e8f33DdMVctjE/bDtPc9EeWd23A3UvLp8xW9avcH7kdE7LhzobUbf9jYiTsefJg40DXCrR2C/8LN5APlEBo6BvqjxF8/FdBt2LmR7Ti4hu0m7NstUx2mrd1yz8GJzgsXDj5waxvff+MTPKuNm6B4ouLYd961EH/7VPxiT9zset/57QkKge07evM8uQmncXKdPVcoB/+dg+19yxjIB6IFvvKjLMKKKMGhIkoBOS0y2OlqnuffJIwlTFBzAJZYK8lNyAjnB9ZPeCRXIYmQkm7IEMtEZxkBpQiympAJcwnQElkskUkJiZnIrMRaCrMA5EuCRxxGHDmlcLyEIWfdjDpEJbnco5DaCFzryehJKKVSsGYl4VMCEqlRUFqUGqH5YX7A/gcpC9jp/FeKoaVs/iU5sIRvhA+GcqWwRhMduszmnIfOtEwZO6tIL4tZyXWjzzx2ax67NehWKLEnpC1IReIE5BSvLiEdWhXHW8l4pUyc3VLnp2F9mSth5YA8Wuqs4wPV8UXrKFSLUArQqddRpT4nlBEqufFa0jN0/d9fKYeZR6+5TJ3ArSS8juJr4YgF8X8lh7f1"));
    // DE Super Spectre
    public final BasePart deSuperSpectre =  createPart(Schematics.readBase64("bXNjaAF4nH1TS47TQBCtOIndtuPYkyAkNmgESAiQl9wATjBihVh47J6JwXGbtjOfEyBWnIEFe87BgVgwyZhX3ZkPMwq22lXdVf3q1es2zenBkEZ1tpSUvHm7f7BqpN4/aGTeaUlhIdtcl01XqpqI3Co7lFVLzvsPc5ouZV2kjVYfkas0zYoSKy0y03aR6SItcvLaLdDze0F5VCGUHimdy1soT+8mdpinuVo2WratLFLdHVPQqFOp01oVkp7c3dAsslambZMB91CXxbGkONfn6qhalUW6LM+kJrGqK5UV8J7d3W6LLpQuV0vUrYtV2dHL/2ZV5WeG1mrVAfFeq7tYvbqnyfW8k/miVpU6PgcFLdPXFJ9mAE/lWaczI9TjHULVBVblrrg6kbrQ5YmkqFlVrbzuMLmRNK0yDXovdtODnG2XVelh1oHUOW7GO+LrQTTAm7A/IJ/IwTshGpqXRvggZYxFIRxYswPLI851EY29vu+/Yfwg3jUj8hCMOTiiPQ7ycwlwFwNrvE4CUK41njUhsB8abwLvkfEis+bCm3pcFUC/UXdMezRkM6NhADMng+aKABXAv19jXNLQjB6kBjTuNxg9UX9hOuR8T+An4pjtkUJ8BdcRqLMGAZf8MbczgT8hsxCPuTEPI2HHpRl3eMktgpgLKk5kwibLoA22aJ5BC03HsQiYGEgxWer/IGvNhJG7IXskA3MCfCaebdTjRqdAchhd0IhLf8X4CUzIJSAxUCP4gszniq2wbMWWLZ81YAWzRY+3gSIjL3dOHpNHKbQ+xjQWPqgNoN8NPYfVNE30yBxt6fqWrs90YzSMa5QQ04c0gaUWXFMLLLXgX2qBFZLFQjy0e0MsE5sJH0oIKZAZcjEXZs77v2B8R86EbxVuEvksdL/uN5B2A7vG7AJez5Kb17HSw7rIT65YcOMRlw+MJgiC/FXQx4SJGBMRrmMEfchs2SNDzWj6CeMXCE6ZzsycnTG+NQGXSfh3YKE8a0IyvyNU+QsvFG89"));
    // DE Ion Cannon 2
    public final BasePart deIonCannon2 =  createPart(Schematics.readBase64("bXNjaAF4nHVUS3LTQBBtS9Ynsh3ZDiFs+C8oitKGKk4ALDgDxUK2JomJrDEj5eM1J2DBBYAqOCEF+SDeGykm5ZBSzUz3dE/36zc9kjsycqVbpHMl8avXD97o4sHLtCiwPJdepsqpmS2qmS5ExM/TicpLcd6+uyX3s9lcFSUsSbmfmiyhNNF5lVSHxqhKnqw72Gmxn5YqKRfpVCUTM8v2lDxad/yPz3jdJ5vK3f8hmOo8V9NKG7m3bq6gw15k2FVG4qlZ6t38cJYl89kJNh6uH2gQ5LMP9KnS4kA24QB8Rr9vcsTHaaVMok4qk9qNYWrm2qiMeY7UEjvRQh/DpdCZkqfXqljpAFNWaZ5M0goRl/L4BvTzhVFliQSm2pPwsMh1mgH7s5sjV2q6X+hc7y1x3KjkxQ3M6CNlMjM7UtevdqLnE8TJ1UIboJMBkid7qlAmZdHXbjpTu7yEZFcbEPiPLpFMpCN9Th1xA2x0MQJxoHpBXde/MWqr+lQ/Y/ywanCpfrdq+M/ZxddhIJfBPJj9RttAx0LwmcBjUhdLLBJaJ5g9HuASEpAnEYN+wvgmEY754vQwBWFEd6aF6aI+5ywOpIv6TKQ+I2Ard4T+UdhFXAfxBBbmYALWCHMgXUA/RYhThPsjfv0Hs4P5HEE9jL5FCwABAVADTVwAcoApItZA+iQPNVlgoXQtH0IbVe9SdeEfMhB3g6sMh1c5hMJgIdgAzE0sXY/hKXkryffIKKXAYzGUQki3bRowG8MRdA9hi8RiRdARpg7de+KGjuWepGxi27WHKfWtNIY0YP7ByjSQqDUNEABTzGCb+Nx2nyjsMiDOGFggx6sC4lUB8aqAeFVA3BZAqcHQB3yXpA5Bqm3OhtQhSG1VVjtkodwN7G5L6hCkrtQe1A3oLgxsUpc3DKtnb/oMsi9boKfHSxwBAhgbUeZiu2WEbvERqWOficPWhib1edspo6ZTRsRCLWiWkF095pkIi89IY7YxOo09J+w5fERRW0Suxdu1j8CzL2fMID3A45Wxm7stXL/ZjkK8NnYu79K2/pb0WPZHjK9W7V+qX3B4m2i4bJDC7eY1brNnXHDe4bvdZuyO7OC/gEPnlgcHqneV4B38F6AetP+FnYb+g/a/sHOVfoayL/onxi/5CzMarn0="));
    // Dimension Enemy Base Dark
    public final BasePart deDark =  createPart(Schematics.readBase64("bXNjaAF4nHVU247TMBCdzaVx06a3vbYL7Eo8IIT8yA+g5SsQD2njbQtpUjnZXfqIxAcg8Qm883vspSWcsbtdqYVG9tjj8cw5M+PSGe275GXxTFH/YjpTWTHNs/P3mZotzt/FhTq/iPVnaiSqGOnpvMQhEdXSeKjSgpwPH3vUwqVEznX+SY3KXFMveXQji0msE5mM6GxbN8xnQ1mqVM1zXSpNr3cubfYjvSjKOJXDuITlgto3MaRUX0odm4CdeX4DRZYnSqaxHisa7HgDCZlOx5OSajq/4oivtm3MNJ+Asyzm8UjJoZ4mcPZy27DEXo7y2VyrolCJ1OV411uiLlPkQ17mGq6eshM+gSVxlaV5nADMi3/GyK+VTvT0WtGb/6enVKNJlqf5eAFMWsm3dLptbOlcx1dpSRHQyrHKlI4Zzk5h1vBUKUteodgxBjlEe/gaZH4R7xzyeb1Hwho4PLnUIkwOdYg8LAIr6laY6y6f8R4/n9UiqFYkqiWFkH61rCpysSKMiEJYeBypBl/GjU9NwtpHJMeBusNxA7jFWY0tBUQrqKrqB8ZPYmMTL7AXA4bowcrni3VqswjBA6o6uXzxO8YvA9tj0zpfrAO92YVwb4SwImQaDWqKDigQ4K+qewZf3VW38HOL1YNZ83xHHuZl9bu6Jad6wO4PyD4QEwEC+AG4EPG6vG5STXCeHPhYYV4iErNoUgDwLSBokmDA9/wozUF9cxDywQrjznhqCMcY+YgVce4Iyog82B+BasTpYEXNKFpIC7LdxiKy+jb0xyZdpuxsgNR32E8XX8TKji1tlyem8Oi8a513187rtM+pbFAP/HzTPD74uQbtPcrPHHsbjj1wNNAtx96GYw8cuaEMR8LWtMIBJ9JDiJoVwoqQxQFX0qFDBi8gTLW/rat9aOt7aLuNuRKjNfiObX8d8X0PO5876RgoXIdObLOf8JmAML33dd17fUbjQ7iCG1mYSuIfF/Xn1u5bT33bkwP7Xga20Qf8Xhw65TOCMG/wmU3/M7bco+ds8hc3xU1k"));
    // DE Electric Dark Light
    public final BasePart deElectricDark =  createPart(Schematics.readBase64("bXNjaAF4nHVV23LjRBBtX2TJ8kW2ZcvO7tYSiqIoitIjf7D7QBV/QPGg2JPErGwZWSab3+CFgjd+gl+BD+ATeNlsEnG6j6mwSa1d4zMzmu4+faZblpdy0pL2Nts4SV69Pn2du2VVrpenr7Lyzem331xcVtJbuf2yXO+qdbEVkU6enbl8L83vvl/IbJdn+yrbrg+b9CrL8zTPygsn0VVWuTJ1b6syW1ZFKcOzcr26cOmy2K4O60oGu0O+f1h+slpv3HaPAOn+MitX6VmxOUsrl7tdUcKTfPn4wMN6WV6DQZ6eZRVOXku4K64Qe1usnAxxaJXuyuIHZzS+eOzGfnaXGbjsd9nSpeQp/n5p7p5arNy5apSeFyWOP7j+/PFBd5Qy3ePxJq0OZekq+fTxMYbN1z8e1qsUSr6RUVZuitKtVJ2f3DV8jx5SOgocHLZ5ka1A8KuPK1O55eW2yIuLa7gqXfq1vHx8uMLabgG7cBZBzOI8Vyqb9VtsTJ54X0r0cJek9+zJIRQPUtLiGZTVRXrhtq7MVKXPPkJgsyvdfo+ccRw19geGNMU+bUKHEBBCQp8wJEwIU/1pyIiQ0FVT5011pvOOj82WnW5h6UtLISB0CSGhR+gTBtJqw2Sq3lrKSSEghIQ+YajM2zJmjISZGIs2WXhkwSw9fH1CQOgSQs3ck14Q1nX9rr7DuJcWRqO+x+q+fl/Xpk0LO+8wbuHHUxIKQxXMk9iH8e8YfyJ0R2aMOKesxqmjnBSMREej+4CQACm7gImYVh/Q9knU14gKA8JQzFcUeKDaVoog5knbRGuIup3zOi18wPCBhg/hMRQTAj57mEd60V2JaTATu6MPWHRZCSG9hfQWMpnwv2dm2Pu/4QDLrjSHGiWI6vci9Y00MdqYdyCn6nZn37q+we8NBNZxZ+6bph644ySuSOMEgIla/Ybxl+3GYjBlvRrBPgn2leDAcmtGgL4n8swubyIGMU8dTRNSNvYDpIEIv2L8DX0G0oXtHBelfmwjwkaC8hvo7U0A8BnjSUtdRVoyAW4p8I+tpSoPzUvPZpHNGphN2WEWPaLcEYs00ruP9OupkylmI589aLpEMlaSt9aH+tSU+cWU6WAZB0F9i9oQK+c72DRM+Rb2PB3GbSRBgApCod+bowaeNDSUsU1sRrZjzCzZEV8FI5Iek9FYtZ9BA0t9LF0l888x9fFRrwZmU81torklgFBTnNjdaM3GWtqexTAYK6UJ400YL9ZAaDr10AH0gy6Sa2N0rBHQt1poSOj2+FLw7Ap8nDWvU8aeMvaUdTWlej+bej6WMd91FnLGkDMazlgDM3bhDF3YsCB6YKRxZko7RjaeWiXsk4SXmrChE/ZgAllxbq43rwZWDAmDzhl0TvM5zec0n9N8ruYKfYK9HRY0WNBgQYOFGsRywmZdMMIJ+/RE2yVGa/hcDQkjwoRgzJ6pM5Hn/NN4rtEVrGle8C/khYb9Fz53l44="));
    // DE Core Powerful
    public final BasePart dePowerful =  createPart(Schematics.readBase64("bXNjaAF4nH1VW2wUVRg+u7PdmU731t2dbrctS7kpFSYajT54wYga8IHEJ2PEJk53T9uF6c46O0u7JEYeqmBUvEFIAEkANcb4YCLw4IMx8qAhmnhBTUwQ46vxyaCWEur3n3+mNS24m9lvzjn/5ftvZ8WwKGsi0XCmpMg9smP4Yc+Xw49709Ifb7uipyZbVb/eDOpeQwiRdJ0x6bZEfOfoGmE1XacVOI16e8qedlzXdh1/QgpzHBZak07Nmxara/Up2WhB2caOX7PHvKkxO5CubHp+IH1x63IB9dOcdFrSbjWdqrTH/HoNVkeWCy6tq34HNFx7zAlgsiMy7UYN7F1v2p5wAiluu6GPYNLziblbf7Zdr9m+1yY+Rrvheg7URdoPJuwJ2ZC+E3i+yDn+FOKq2VWvsUd2sJOBUVD1vV2yShKV5W6Y/6LBNTc+D/0jj7tXZqMmx11Yt5FSiC75ynCGFrms8B1gbXt7pF/z63ukGFhh2PF3w/XEZCD0aqfqeg0pNt08xYGsTjY815vowKcv7XtEMkzYigo3qXXshgzsgN7EhuUCkiLy61W7hUim7KDt+zIQ2WmUyrflTOA7KkQdwdXadZygvt64S0maqs/AYhY8oI5sVGWrBdGelofWs5tOQ7pi7QpCK5vpxukih9iFB73VJI5SrP/f1okY5lckrnqTxo40MS1eRw0NhuqiWPrEGRIMSQaDwWRIMWQYcgx5hiJD36KpmNDIWBxgMPQI/MRFWhf0Qq5oN8uHeQaL9UskoUF0YWFhE56XI2YJpSW6AGlel+inizaTAJ0BHnVAdxcxMvBm8kZ6cSPDGzm1oeGtl3yN4Nmvlnl9MS/dWBZEnHaLkdBslCMTECe2SZGIVHIIFSySinJK5ULACnkkOZ3kutRREl+D0pwkOTrspcOs0iEjeTbSFxmB66tKTjHZqJgQBYuLVhIqBwl61zkZOjvQiQBt9aiI6S0TJkMnfxqgqC81AJfeBKjoDEQHZ7fgOQSq3RQ87Rq0O6/iwYJKTIDSpCFTYAMWm1M17WY7G5QdWhrks1f5NbDsFgqy1GXdXJMNqiZhE2bhQiNhk2tshvEYeEvxRiYsqcnq65W6ia/FEZWoQGlKDvE1GTJEIkVEqE8LpLgOzwtqWYyWs9EQ6IBUmMhU2FUxGC3ymJTIT5ozl+aI58NhybIBNUMFQEJoqITqwxIww6TnwyHM8Hhl2GKWLWbZ4mqVQyoeKQ+og97oYD+Us6yc4znJUWUJumhYeyl+CwIQ6cGmxX1Woj5b4M/fSrdEofWSY4LE4sTTxFp62JJXcJDn2c/zQBZIowTQRKwfAMUywKS4z84cb782an5+R2rfJuPg3peGnGNbZt7+aLzx89mPH/xq9KfCP5u3v9o4ZeS3frlty5ubZ3NHHui6dHTd6+8dHD5yIn7m6cvH7+scGM12fTNyavyZUz9+d3KrXnt/MPb1oQ+uxHY8ev/57986d+zuo2cuHP31w+TlJwevdn6/y/9lLn9u397Pvj1f3nXxxDt/xA7/dvqpjdfn5r64/fnnrvsjT6y5d9vJ7Y/VxkZ3bvv0Ibl/7aXZa0n5yZ1X44NvvDuvHbsgf0CGC6gdqlVQBae5KnAdVdUHAVo02ZTUokhyUpNhUufVewIHhlCgmr1IDWECLDal0mdRkw8BErxSI2zxCFuq5XX1lgmJWDQxJKgaGHWlPijjeREcLTyx8GrWaDTo8M/wiumLWPaELOcUS5JTsz2H5xo89PFs99Fsk1Yva5UjLRWfiQM19H0cTR9FM4QfjdJSomuaLmyDr4NuBrrsRL9Qmeun7PUAkv+598JepJ1+nvr+MAUG3lK8wZlYBUJ5ItDPBPqJwCA2VcwWnsPgU+a0lrkOZSZS5qugTCXVADnS+Cu8dwc4dwMirqt80G5FzZwWg32dD1N0WMTzilqmo/8DTS1z0ekBeBpgfgPEbzUoaRTfIEWvAUwSLeA5qA5TLKMSNcQXwxCJJgAmRTtEdScoMFgsqVppFUkOA9T9WWFGFf6PrvBAV/ivrMJ3fiWSTDFkGHIMeYYiA+rzL3g8cI4="));

    private final Seq<BasePart> removed = new Seq<>();
    private final BasePart[] coreParts = new BasePart[]{
        deBaseSmall, // 4
        deSquareDefence, // 5
        deSuperSpectre, // 6
        deIonCannon2, // 7
        deDark, // 8
        deElectricDark, // 9
        dePowerful, // 10
    };

    // -- Not important --
    // at titanium, plastanium ripple
    public final BasePart partPlastaniumRipple =  createPart(Schematics.readBase64("bXNjaAF4nF1PQVLDMBBT7KRNk5QOH+DAjYNPvMhNDPWME2fslNKP8Ra+Qqc0yLnAcNjR7lrSytjiTiAfdG8gzDPqzsQ22HGyfgDucB+900GNejBOsXs1WPF5dMTeDJ0J2J30ZIIy71PQ7eQDHjvLp0gHFQ86dGo86GhUHHVr1D7YbjHxR6pQ28n0KvpjaA223ro/PtXoTzQefGewi9bZNjn2xi1CR8+gumCdQxG1e/PYtV471ZphCvblyCtP/5P8zm04x4nsvZ5odwbwAGSQEBlhgyxBwzUEVlwj5ywEuxxSEkpk7FCt5/l2ZV1EwbGGTJwGcpWIBXUiZ5eTNn+wPuUaBR2zktuqLIH5wjWLh7L5C3K+sK7I5xsZPEo6c2yQ7GVF6SZdXkEky28GLEWNNdWiIVAiCUvkMglT0iVruWSdr+kaH6tkl4DULT2r9NeajUzQpH8kP/kDuuCH0Q=="));
    // e1 at dimension shard
    public final BasePart partAtDimensionShard =  createPart(Schematics.readBase64("bXNjaAF4nF2Q0W+bMBDGr0AcAiEkq7TXSX23tP490x4cOKVMBiPjJO1fPm3tyr7DzUtldL873/edjemedillg+mZEn6ksuWp8d0YOjcQkbLmyHai5MfPHX1pu56HCR09PRnf6rahb5/3jq4/6sCWR+cDe6p8OOkTD+xNcJ72xvfOc6sbN1z4BTsPnycsITw535173frOWjpMzhqvRzOw1chOTNV4thPLmPbcBapHa6ZgBvFcDSz11eB4zc/Bm0ZOXh9NwM4LrdrOtUz37sIe4y+sR+9+8SLaj+4K1wDBxzllF7jXkzv7hvEg34nuqJCQ0EqQIsGX0FqQ0oYQMqw0g0ARwoq2tMjTCEiIcngXVxqxEWUuSgWsKFkDsAvWEbm4NmJQACRSQbLBQq9YklRCIZJCJJLnYpfugiKilGFlHFaKsgQwbAvkeT2/0d38d36f34kkzr/nf4ivqF6R/cHtM0pQJ1BkYAYqUIEVZhR4na8k85Zf2sb7VvHA6lYpeYqdXE0By2YdJfWtUlLtY3WIvcOtQu8/oISRjQ=="));
    // s6 at dimension shard, power + bomb teleporter
    public final BasePart partBombTeleporter =  createPart(Schematics.readBase64("bXNjaAF4nCWO3W6DMAyFDxTKgK3tbqbd7Qlyu5eZdhHAapECqZx0Xd9+x0yO8tk+/sMJ3Q7V6hdBmT7RT5JGna95jiuAffCDhITy67vFa4rBq7v6VYKjdxb06Ua4HO+iaAafs+gDH9O8yJo4wqWL18kNcRlcliDXqKzAi+azO8sq6nNUnLwuUWVyY1x/5MFMPwSfspt0DgHHu2eTk9+sfrT6fs6yuBRvOgqPfAcKVPbx4CegJDcUBmBnyo7WGCorrVBbsqbtUVpEbc+PWkMrrMQcov2PWotqdBzB19Pl9A4t+cbE87aW2FYeTC6IYjvkYE0ljoY/N/lBpg=="));
    // Dimension Shard Power Center
    public final BasePart partDimensionShardPower =  createPart(Schematics.readBase64("bXNjaAF4nG1Sy46bQBBsg3mvMfZ6X1GUrJJTDnxFlHvuUaRgGHmRgLEG8MZ/n6oZbw5OhER3dXVV9wzIe9n6shyqXkn+7fm7flXm+asaJmUka9RYm/Y4tXoQkbCr9qobxfvxcy3bpu3VMIIpx5fKNGVTSzbO5qDKiR4S7asJJmfZjLqrTHmsBtWVyA5KPl6L97rfl5Pq1FEbTl6/Vgil+j2Zqp403Go9NHM7SWj0zI6iMr02qilBnNQZLfE8dLpqwH2+tp+A0dgfjRpHaMx0kC//HOAvrs15nKqufDvBp+tWZ/qiTTv3ZWParpMP/52pT8qAPynJ2kn15ahnUyvc5S+RhSyRiIfEhhuWPAljAk9iBxNEfB/2ekiAmK8pCagMgEJyS3JECQUB7UIEK48oD4BDsa/YIXRGCLl4SyQFPWN6hkBWF9MlBkILraw8dvLYyWNwC19STqAjuARPHojco5rSNpXMrZo6h9Q5pHQghyEZkpxc5hyyi0MC0r94raABXLGDaC1Wu2FYcXlaeC7cuKLlcnIMFq1dZ0GzBOht08JtuuGmCXI3NUAWca8CRY8oFeu7otcGdwRuQy6R7UXjyy3NAxSsdOukW0oFXMFvuOOcCMg63LLFR3HF+96xGCBY+c7Jd5RHckfOt5uBuyPHmdbzgXkAZHX3TsezQfBAaw8h4RJPlC/kUSL7tz2ySpjGji1YfXK976jMETJ7uj9E3Y45"));
    // Sun Power
    public final BasePart partSumPower =  createPart(Schematics.readBase64("bXNjaAF4nD2NUQrCMBBExzYQSAlF//zrBXIM/wVPEJtFC21akoh4e3cbkWz2JezMLHr0DVT0C6G7DLdXHK7rmxK6QHlM01amNQItjnmdfXKbjzQ7fj0IpzAtFDMLXH76FFwYYe++FEqfnwQ4Awc+jTTFf4bmy2UqrECJRKB4FTddYdCKy4pvdwlY0jC0GLRIBPafCMaeYmqKqRJTU2RbK1AVWjZYnu4zlnwBzx4e5A=="));
    // Shard Receiver Power
    public final BasePart partShardReceiver =  createPart(Schematics.readBase64("bXNjaAF4nGWQzU7DMBCEx/kpEW3VUHFuK3Hi4MfgjsQTOM4qREriaG1AfXt2E4lDsKWdnc+7czDO2GcoJjcSjm+3j0/H7e09/BBj31L03M+pDxPwgHPbjzRFcTbqmG09rlvWhLGxiQaaAycNiV/ckU1L4uu/hD/v+R6TG2zjkqzdcdmOrpXJU/8tUU8xDI7t7CYarHQd4WW7ksRbH8aZKUaS5dQBeAYMMi0GFaQzKCrkuegOyAWIFHINUIqUyNTJ6E4+YXGVvqks8HGFhxUeFJY4KjSoFWY4Ia80+yRUTi1B4mp1v2n7VWA="));
    // Small DC
    public final BasePart partSmallDc =  createPart(Schematics.readBase64("bXNjaAF4nGWO3WrDMAyFj3+SNs1grE+wi0HZRS73QF5iloDjBNtl5O0nWYNBZ4QsfTo+Fho8adjoVg/tP9BPPo9p2cuyRaDF8x5cLi4u93X4diHgdVpWHzONhzy7NP3mfXbZi+L2qKipzFtiE1Jshwhf8hZcGnYXfRio+vJ4f3z714/poEXC8OlK8enA9Z90BPCGegwnVQO6hiDACmwEtgJPAs8CO4GXytBD6VopQ1MNY6mz0A3VLQzDTr7qYVQ1UDRmCXc9f2wEGobkINDKUmxnqpwfsEgzrEpLe1bYCjwJPAvsBF7kIs8f0xBIyw=="));
    // at sand
    public final BasePart partAtSand =  createPart(Schematics.readBase64("bXNjaAF4nF1PQVLDMBBT7KRNk5QOH+DAjYNPvMhNDPWME2fslNKP8Ra+Qqc0yLnAcNjR7lrSytjiTiAfdG8gzDPqzsQ22HGyfgDucB+900GNejBOsXs1WPF5dMTeDJ0J2J30ZIIy71PQ7eQDHjvLp0gHFQ86dGo86GhUHHVr1D7YbjHxR6pQ28n0KvpjaA223ro/PtXoTzQefGewi9bZNjn2xi1CR8+gumCdQxG1e/PYtV471ZphCvblyCtP/5P8zm04x4nsvZ5odwbwAGSQEBlhgyxBwzUEVlwj5ywEuxxSEkpk7FCt5/l2ZV1EwbGGTJwGcpWIBXUiZ5eTNn+wPuUaBR2zktuqLIH5wjWLh7L5C3K+sK7I5xsZPEo6c2yQ7GVF6SZdXkEky28GLEWNNdWiIVAiCUvkMglT0iVruWSdr+kaH6tkl4DULT2r9NeajUzQpH8kP/kDuuCH0Q=="));
    // Scrap Foreshadow
    public final BasePart partScrapForeshadow =  createPart(Schematics.readBase64("bXNjaAF4nHVV7W7cRBS99ther71ee7/yWdqmLVT88GPAC/AErtdNXXltY3sTwh+Q+AP8QAgeiVcAhBAS4hUQArVpspwzTrpJEIlmzpzxnTv33jkzK/dl1xSrTFaZTD94+FHaJPXDD6sma18ky+pU/GXWpk1ed3lVijyVSVsVSRPXSZkVMUbHmYSnSZc1cfZJ1yRpVzXy/jJfZWWLFTG8NMt4y9PmrO2SIn6WdFhzJl5dnWJtWS0zGT9r8uVxFqdVuVznncyqk6xZNvlJFtdN9TLTvv28TPMyaxKS+3c36vsmSzOsaiTMS0CX4UMFaGS0zNukbbPVswLMQV51kcmju27qF0mbxW2dpFncByVP79r8n+F/nOmue1E1+XoVI52ikMd3bTpw5L2qUfcW4TbdsbjrsqiSJeNcZQWjn9VFguqVdIQinWRnqEG4rVo/4aXrostPdIEmXX7XPijyj9c5tqjW9BltD+DqOP28y1Yo2LpJQVZ0Fuu4xLmqYnjl4uW6TLUuhm1WJ/2RLG7F2CeE6ShpVhDVchuH39aYuPIcphVEkWZl1+TP1wgiqNdFu5VCQCk8L6rT+BhaE+/5VqCD9CwtqhIybPMiT1nSq3IFSVFUZ2+pB5fwkn+KscgPIoYoMQyMbTFNwEBMMldMBfBcXIvNJdq5nvbF5JJITAswGGCKi3rqbakNGnBsykyUAdDuzd692bs34d65dr+53Fyg4V+MzUaUNvNprfAvFrpb26mb2/F7SOC+WGJxOwUYuENx4HSzeSMmmqXbJUwtbWsRMceRywgt8UQzbI3YkARCtmUqeoHFLVkXUaS3ArJvBuSCBjbWIneHKwg2zZx+laHNOOv2s97tWWw/xM5jUR4sDDGQC1Yike/RfjVJvS31QRf0wKm/1QhrFIffof1hMLcboRvC8MxAhhgImS/GGGwixgAwpyCGNA4BTMM1I4zGjM/vK+zRwwQAThj1EPQASx8QMoRv0X4yFAwVTpvHaelIlK4JDgeelMmC3wrRp+cQ3fX+Pr0OsVHE/Uc0nALs7aIZqMMTYPoIYCRDfhxT3GoCiqOdAxAkQacTYKYPWNQCDFntAFyXckKQFKcIUjiHfs43b4BDqhnobF6h3OfiwoYaoZIu+5RQmYC7KYDvDjCtIDIq3tpcaNFRwDbcXqLwY6rMRTdFqg5OC6f+Nish1ZURLZAFKMxmAOQ6AXiia+Oz2N+g/aJc0JDqM3YwiniHcaleiY28x9SygZPV9Qtv1s8EReEifexIIaRrMn0XQt6wObopjSPWbRdsRx/PHrUjaop5++0twIFEDHIhVI+ivuBpHyzQic4xGouGkDlEEjGHr9F+FM7qWzfplfwVlawOQFE6AlRzCHApFpbbvCcM2XwHgDVzdFNR99kxsCkCg4sv0X5XCnTg2vqlMTf8e40Tes3nwRjh20RfI7Q/DZYaqT4AQPgPATZjnYlDm3+Q5tDYBx2w3qjPjBEdAYaimdczJP4IfnDQj4WhmQ8Aig7nfIh8gHb4ho8uyBySgqe5DOF3ZHLk69ETlNPg47YQ2x30etIv6AZ6uqCm9EvFO+XAxmHBFzo6y3xXduAcKe0wpScAxSB3aH0EcHo2oB52ESSsdrnZFGBeS1ApUvs2dRn7F2i/QXy7MmKoxhFGuGuHgDEPZK8PfA8PATfaQ6AabE7s9ZkKRzpToeXIhSD5kyD88TB4WHpkXl0n3FHlwC5gyPvMag6A3XsAfPYBWj6f89z1rNXb4KIfAYYQIgBCJ/Mp7H39Ygg1hvAOem8H9LYPUIjNMDihHR3Q0SHAZaIHfLQiQECNHMj4euufNdXvIf/+gugP6ZhgsjaHVCmBD4Pc47WxwPQT/xmfeEUa6KqDXqgIFFX9FwNODGQ="));
    // Thorium spectre
    public final BasePart partWThoriumSpectre =  createPart(Schematics.readBase64("bXNjaAF4nG1SW07DMBCcOG3TNCmFIs6A+uE/TsEt3MRqI+Ul21XpxTgOVwmzMUIISOTMend29qHgDo8Ki950Fsq+oKitr1wzhmbogQL7uuls73nT/mxcresKD35ojdOj6W2raZ0s9G/a/AnnwTWXTpu2HW76SviiP42t8cH0Evzh3rpw0ifbW2fC4LC7mmCdtm/BmUocmR9tFZxFcZR8XbumbfH8b+3xbLzVfjSV1UfX1JQ//Jnl+165G/tp9dEElryhaILttB8urrIADkCCBVKBLMImwhZpQrhHoiCGUvQTUsyv5CwjMI8WciQiVSJdEXaAIoGP8BToWvKQvOLBmrcNkYqRsZK6OaGEWhO22TRNrzwfTM6iThZ1MtHJCTM1I5XRd6GqFYVZeUPvnsWzdE3HRqQmUVAJ89igkmYx9zyPksdR8jhKLlHFX0R6I31eTxnXU8b1lHE9paznEwZDeNQ="));
    // At thorium, Dark Light
    public final BasePart partThoriumDarkLight =  createPart(Schematics.readBase64("bXNjaAF4nGWQzU7DMBCEJ85vnYaIK6dKnDj4LeDGS7iJlUbkT7ar0rdnlhwqgWLttxPP7tpGi1YhW+zscPw4vVv/dfoch0tE3bvQ+XGL47oANZ7DOllvNru4yTAbHOpwJUxcb85TPPbx2o+zWwJLTbhY35tIbbp13rwLwfXGxwFvf00P3fl7iHYyZxuj83e0N0sa9x297eLq0bCBGdzivBX58q8VL2Km/SLnyYZoej9OE/QmhzXL2vP4Y3SzCevVdw7ACUigJSTIKv6AQgmliCNSQbPjCWmKDCmUhBwqJw5IBPWOBklBC1NBiVRyWkrmR6gCBfukFVUOiKqQ5gxKCip+iTw5g3TMwKVp4tIs4QS9z9P7PC3zDsyL32M34hHoHdwUR85RJX4AQWFd4g=="));
    // @formatter:on

    private static final Vec2 axis = new Vec2(), rotator = new Vec2();

    private static final int range = 180;
    private static boolean insanity = false;

    private Tiles tiles;
    private Seq<Tile> cores;


    /**
     * Round the difficulty to [1, 12], usually 10 is max value
     *
     * @param difficulty difficulty
     * @return int value
     */
    public static int difficultyLevel(float difficulty) {
        return (int) (difficulty * 10f);
    }

    public static Wall getDifficultyWall(int size, float difficulty) {
        int level = difficultyLevel(difficulty);
        int index = Math.min(level - MIN_WALL_DIFFICULTY, AVAILABLE_WALLS.length - 1);
        return size == 1 ? AVAILABLE_WALLS[index] : AVAILABLE_WALLS_LARGE[index];
    }

    public void generate(Tiles tiles, Seq<Tile> cores, Tile spawn, Team team, Sector sector, float difficulty) {
        this.tiles = tiles;
        this.cores = cores;

        //don't generate bases when there are no loaded schematics
        if (bases.cores.isEmpty()) {
            return;
        }

        Mathf.rand.setSeed(sector.id);

        float bracketRange = 0.17f;
        float baseChance = Mathf.lerp(0.7f, 2.1f, difficulty);
        int wallAngle = 100; //180 for full coverage
        double resourceChance = 0.5 * baseChance;
        double nonResourceChance = 0.002 * baseChance;
        BasePart coreschem = getCoreSchematic(difficulty);
        int passes = difficulty < 0.4 ? 1 : difficulty < 0.8 ? 3 : 5;

        Wall wall = getDifficultyWall(1, difficulty);
        Wall wallLarge = getDifficultyWall(2, difficulty);

        registerParts();

        for (int i = 0; i < passes; i++) {
            //random schematics
            pass(tile -> {
                if (!tile.block().alwaysReplace) {
                    return;
                }

                if (((tile.overlay().asFloor().itemDrop != null ||
                    (tile.drop() != null && Mathf.chance(nonResourceChance)))
                    || (tile.floor().liquidDrop != null && Mathf.chance(nonResourceChance * 2))) &&
                    Mathf.chance(resourceChance)) {
                    Seq<BasePart> parts =
                        bases.forResource(tile.drop() != null ? tile.drop() : tile.floor().liquidDrop);
                    if (!parts.isEmpty()) {
                        tryPlace(parts.getFrac(difficulty + Mathf.range(bracketRange)), tile.x, tile.y, team);
                    }
                } else if (Mathf.chance(nonResourceChance)) {
                    tryPlace(bases.parts.getFrac(Mathf.random(1f)), tile.x, tile.y, team);
                }
            });
        }
        unregisterParts();

        //replace walls with the correct type (disabled)
        if (false) {
            pass(tile -> {
                if (tile.block() instanceof Wall && tile.team() == team && tile.block() != wall &&
                    tile.block() != wallLarge) {
                    tile.setBlock(tile.block().size == 2 ? wallLarge : wall, team);
                }
            });
        }

        // for (Tile tile : cores) {
        //     tile.clearOverlay();
        //     placeCoreLoadout(coreschem.schematic, tile.x, tile.y, team, true);
        //
        //     //fill core with every type of item (even non-material)
        //     Building entity = tile.build;
        //     for (Item item : content.items()) {
        //         entity.items.add(item, entity.block.itemCapacity);
        //     }
        // }

        //small walls
        pass(tile -> {

            if (tile.block().alwaysReplace) {
                boolean any = false;

                for (Point2 p : Geometry.d4) {
                    Tile o = tiles.get(tile.x + p.x, tile.y + p.y);

                    //do not block payloads
                    if (o != null && (o.block() instanceof PayloadConveyor || o.block() instanceof PayloadBlock)) {
                        return;
                    }
                }

                for (Point2 p : Geometry.d8) {
                    if (Angles.angleDist(Angles.angle(p.x, p.y), spawn.angleTo(tile)) > wallAngle) {
                        continue;
                    }

                    Tile o = tiles.get(tile.x + p.x, tile.y + p.y);
                    if (o != null && o.team() == team && !(o.block() instanceof Wall)) {
                        any = true;
                        break;
                    }
                }

                if (any) {
                    tile.setBlock(wall, team);
                }
            }
        });

        //large walls
        pass(curr -> {
            int walls = 0;
            for (int cx = 0; cx < 2; cx++) {
                for (int cy = 0; cy < 2; cy++) {
                    Tile tile = tiles.get(curr.x + cx, curr.y + cy);
                    if (tile == null || tile.block().size != 1 ||
                        (tile.block() != wall && !tile.block().alwaysReplace)) {
                        return;
                    }

                    if (tile.block() == wall) {
                        walls++;
                    }
                }
            }

            if (walls >= 3) {
                curr.setBlock(wallLarge, team);
            }
        });


        float coreDst = 10f * 8;

        //clear path for ground units
        for (Tile tile : cores) {
            Astar.pathfind(tile, spawn, t -> t.team() == state.rules.waveTeam && !t.within(tile, coreDst) ? 100000 :
                t.floor().hasSurface() ? 1 : 10, t -> !t.block().isStatic()).each(t -> {
                if (!t.within(tile, coreDst)) {
                    if (t.team() == state.rules.waveTeam) {
                        t.setBlock(Blocks.air);
                    }

                    for (Point2 p : Geometry.d8) {
                        Tile other = t.nearby(p);
                        if (other != null && other.team() == state.rules.waveTeam) {
                            other.setBlock(Blocks.air);
                        }
                    }
                }
            });
        }

        for (Tile tile : cores) {
            tile.clearOverlay();
            placeCoreLoadout(coreschem.schematic, tile.x, tile.y, team, true);

            //fill core with every type of item (even non-material)
            Building entity = tile.build;
            for (Item item : content.items()) {
                entity.items.add(item, entity.block.itemCapacity);
            }
        }

        //small walls
        pass(tile -> {

            if (tile.block().alwaysReplace) {
                boolean any = false;

                for (Point2 p : Geometry.d4) {
                    Tile o = tiles.get(tile.x + p.x, tile.y + p.y);

                    //do not block payloads
                    if (o != null && (o.block() instanceof PayloadConveyor || o.block() instanceof PayloadBlock)) {
                        return;
                    }
                }

                for (Point2 p : Geometry.d8) {
                    if (Angles.angleDist(Angles.angle(p.x, p.y), spawn.angleTo(tile)) > wallAngle) {
                        continue;
                    }

                    Tile o = tiles.get(tile.x + p.x, tile.y + p.y);
                    if (o != null && o.team() == team && !(o.block() instanceof Wall)) {
                        any = true;
                        break;
                    }
                }

                if (any) {
                    tile.setBlock(wall, team);
                }
            }
        });

        //large walls
        pass(curr -> {
            int walls = 0;
            for (int cx = 0; cx < 2; cx++) {
                for (int cy = 0; cy < 2; cy++) {
                    Tile tile = tiles.get(curr.x + cx, curr.y + cy);
                    if (tile == null || tile.block().size != 1 ||
                        (tile.block() != wall && !tile.block().alwaysReplace)) {
                        return;
                    }

                    if (tile.block() == wall) {
                        walls++;
                    }
                }
            }

            if (walls >= 3) {
                curr.setBlock(wallLarge, team);
            }
        });
    }

    private void unregisterParts() {
        parts.forEach(part -> {
            if (part.core != null) {
                Vars.bases.cores.remove(part);
            } else if (part.required == null) {
                Vars.bases.parts.remove(part);
            }
            if (part.required != null && part.core == null) {
                Vars.bases.reqParts.get(part.required, Seq::new).remove(part);
            }
        });
        while (removed.size > 0) {
            Vars.bases.cores.add(removed.pop());
        }
        Vars.bases.cores.sort((b -> b.tier));
    }

    private void registerParts() {
        while (Vars.bases.cores.size > 0) {
            removed.add(Vars.bases.cores.pop());
        }

        parts.forEach(part -> {
            if (part.core != null) {
                Vars.bases.cores.add(part);
            } else if (part.required == null) {
                Vars.bases.parts.add(part);
            }

            if (part.required != null && part.core == null) {
                Vars.bases.reqParts.get(part.required, Seq::new).add(part);
            }
        });
        Vars.bases.cores.sort(b -> b.tier);
    }

    /**
     * Get schematic contains core for enemy base
     *
     * @param difficulty difficulty, [0,1]
     * @return core part
     */
    private BasePart getCoreSchematic(float difficulty) {
        int i = Math.min(difficultyLevel(difficulty) - MIN_WALL_DIFFICULTY, coreParts.length - 1);
        return coreParts[i];
    }

    public void postGenerate() {
        if (tiles == null) {
            return;
        }

        for (Tile tile : tiles) {
            if (tile.isCenter() && tile.block() instanceof PowerNode && tile.team() == state.rules.waveTeam) {
                tile.build.configureAny(new Point2[0]);
                tile.build.placed();
            }
        }
    }

    void pass(Cons<Tile> cons) {
        Tile core = cores.first();
        core.circle(range, (x, y) -> cons.get(tiles.getn(x, y)));
    }

    /**
     * Tries to place a base part at a certain location with a certain team.
     *
     * @return success state
     */
    public static boolean tryPlace(BasePart part, int x, int y, Team team) {
        return tryPlace(part, x, y, team, null);
    }

    /**
     * Tries to place a base part at a certain location with a certain team.
     *
     * @return success state
     */
    public static boolean tryPlace(BasePart part, int x, int y, Team team, @Nullable Intc2 posc) {
        int rotation = Mathf.range(2);
        axis.set((int) (part.schematic.width / 2f), (int) (part.schematic.height / 2f));
        Schematic result = Schematics.rotate(part.schematic, rotation);
        int rotdeg = rotation * 90;

        rotator.set(part.centerX, part.centerY).rotateAround(axis, rotdeg);
        //bottom left schematic corner
        int cx = x - (int) rotator.x;
        int cy = y - (int) rotator.y;

        for (Stile tile : result.tiles) {
            int realX = tile.x + cx, realY = tile.y + cy;
            if (!insanity && isTaken(tile.block, realX, realY)) {
                return false;
            }

            if (posc != null) {
                posc.get(realX, realY);
            }
        }

        if (part.required instanceof Item item) {
            for (Stile tile : result.tiles) {
                //uncomment for extra checks if changed above
                if (tile.block instanceof Drill && (!insanity || !isTaken(tile.block, tile.x + cx, tile.y + cy))) {

                    tile.block.iterateTaken(tile.x + cx, tile.y + cy, (ex, ey) -> {
                        Tile placed = world.tiles.get(ex, ey);

                        if (placed == null) {
                            return;
                        }

                        if (placed.floor().hasSurface()) {
                            set(placed, item);
                        }

                        Tile rand = world.tiles.getc(ex + Mathf.range(1), ey + Mathf.range(1));
                        if (rand.floor().hasSurface()) {
                            //random ores nearby to make it look more natural
                            set(rand, item);
                        }
                    });
                }
            }
        }

        Schematics.place(result, cx + result.width / 2, cy + result.height / 2, team, false);

        //fill drills with items after placing
        if (part.required instanceof Item item) {
            for (Stile tile : result.tiles) {
                if (tile.block instanceof Drill) {

                    var build = world.build(tile.x + cx, tile.y + cy);

                    if (build != null && build.block == tile.block) {
                        build.items.add(item, build.block.itemCapacity);
                    }
                }
            }
        }

        return true;
    }

    static void set(Tile tile, Item item) {
        if (bases.ores.containsKey(item)) {
            tile.setOverlay(bases.ores.get(item));
        } else if (bases.oreFloors.containsKey(item)) {
            tile.setFloor(bases.oreFloors.get(item));
        }
    }

    static boolean isTaken(Block block, int x, int y) {
        int offsetx = -(block.size - 1) / 2;
        int offsety = -(block.size - 1) / 2;
        int pad = 1;

        for (int dx = -pad; dx < block.size + pad; dx++) {
            for (int dy = -pad; dy < block.size + pad; dy++) {
                if (overlaps(dx + offsetx + x, dy + offsety + y)) {
                    return true;
                }
            }
        }

        return false;
    }

    static boolean overlaps(int x, int y) {
        Tile tile = world.tiles.get(x, y);

        return tile == null || !tile.block().alwaysReplace || world.getDarkness(x, y) > 0;
    }

    public BaseRegistry.BasePart createPart(Schematic schem) {
        var part = new BaseRegistry.BasePart(schem);
        Tmp.v1.setZero();
        int drills = 0;
        for (final Schematic.Stile tile : schem.tiles) {
            if (tile.block.priority == TargetPriority.core && tile.block.buildType != null) {
                part.core = tile.block;
            }

            //save the required resource based on item source - multiple sources are not allowed
            if (tile.block instanceof ItemSource) {
                var config = tile.config;
                if (config != null) {
                    part.required = (Content) config;
                }
            }

            if (tile.block instanceof Drill || tile.block instanceof Pump) {
                Tmp.v1.add(tile.x * Vars.tilesize + tile.block.offset, tile.y * Vars.tilesize + tile.block.offset);
                drills++;
            }
        }
        schem.tiles.removeAll((s -> s.block.buildVisibility == BuildVisibility.sandboxOnly));

        part.tier = schem.tiles.sumf((s -> Mathf.pow(s.block.buildCost / s.block.buildCostMultiplier, 1.4f)));

        if (drills > 0) {
            Tmp.v1.scl(1f / drills).scl(1f / Vars.tilesize);
            part.centerX = (int) Tmp.v1.x;
            part.centerY = (int) Tmp.v1.y;
        } else {
            part.centerX = part.schematic.width / 2;
            part.centerY = part.schematic.height / 2;
        }
        parts.add(part);
        return part;
    }

    /**
     * Copied from {@link Schematics#placeLoadout(Schematic, int, int, Team, boolean)}
     *
     * @param schem schematic
     * @param x     center x
     * @param y     center y
     * @param team  team
     * @param check check for blocks that ore in the way
     */
    public static void placeCoreLoadout(Schematic schem, int x, int y, Team team, boolean check) {
        Stile coreTile = schem.tiles.find(s -> s.block instanceof CoreBlock);
        Seq<Tile> seq = new Seq<>();
        if (coreTile == null) {
            throw new IllegalArgumentException("Loadout schematic has no core tile!");
        }
        int ox = x - coreTile.x, oy = y - coreTile.y;
        // place logic block at last
        schem.tiles.copy().sort(s -> s.block instanceof LogicBlock ? 9999 : -s.block.schematicPriority).each(st -> {
            Tile tile = world.tile(st.x + ox, st.y + oy);
            if (tile == null) {
                return;
            }

            //check for blocks that are in the way.
            if (check && !(st.block instanceof CoreBlock)) {
                seq.clear();
                tile.getLinkedTilesAs(st.block, seq);
                //remove env blocks, or not?
                //if(seq.contains(t -> !t.block().alwaysReplace && !t.synthetic())){
                //    return;
                //}
                for (var t : seq) {
                    if (t.block() != Blocks.air) {
                        t.remove();
                    }
                }
            }

            tile.setBlock(st.block, team, st.rotation);

            Object config = st.config;
            if (tile.build != null) {
                tile.build.configureAny(config);
            }

            if (tile.build instanceof CoreBlock.CoreBuild cb) {
                state.teams.registerCore(cb);
            }
        });
    }
}
