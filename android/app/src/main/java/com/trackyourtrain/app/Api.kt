package com.trackyourtrain.app

import retrofit2.http.GET
import retrofit2.http.Query

data class Station(val code:String, val name:String)
data class TrainSummary(val number:String, val name:String, val type:String?, val runDays:List<String>?)
data class BetweenTrain(
    val train:TrainSummary,
    val from:FromStop,
    val to:ToStop,
    val distance:Double?,
    val duration:Int?,
    val totalHaltsBetween:Int?,
    val live:LiveSummary?
)
data class FromStop(val departure:String?, val day:Int?, val sequence:Int?)
data class ToStop(val arrival:String?, val day:Int?, val sequence:Int?)
data class LiveSummary(
    val type:String?,
    val expectedArrivalTime:String?,
    val expectedDepartureTime:String?,
    val delayMinutes:Int?
)

data class Fare(
    val trainNumber:String?,
    val trainName:String?,
    val classCode:String?,
    val quotaCode:String?,
    val totalFare:Int?,
    val breakdown:Map<String,Any>?
)

data class LiveResponse(val success:Boolean?, val data:LiveData?)
data class LiveData(
    val trainNumber:String?,
    val trainName:String?,
    val delayMinutes:Int?,
    val speed:Double?,
    val currentLocation:LocationPoint?,
    val nextHalt:NextHalt?,
    val route:List<RouteStop>?
)

data class LocationPoint(
    val lat:Double?,
    val lng:Double?,
    val segmentProgress:Double?,
    val bearing:Double?
)

data class NextHalt(
    val code:String?,
    val name:String?,
    val expectedArrival:String?,
    val delayMinutes:Int?
)

data class RouteStop(
    val code:String?,
    val name:String?,
    val lat:Double?,
    val lng:Double?,
    val sequence:Int?,
    val arrival:String?,
    val departure:String?,
    val day:Int?
)

interface TrackApi {
    @GET("/api/stations")
    suspend fun stations(@Query("q") q:String): StationResponse

    @GET("/api/between")
    suspend fun between(
        @Query("from") from:String,
        @Query("to") to:String,
        @Query("date") date:String
    ): BetweenResponse

    @GET("/api/live")
    suspend fun live(
        @Query("number") number:String,
        @Query("date") date:String
    ): LiveResponse

    @GET("/api/fare")
    suspend fun fare(
        @Query("number") number:String,
        @Query("source") source:String,
        @Query("destination") destination:String,
        @Query("date") date:String,
        @Query("classCode") classCode:String
    ): FareResponse
}

data class StationResponse(val data:List<Station>?)
data class BetweenResponse(val data:BetweenData?)
data class BetweenData(val trains:List<BetweenTrain>?)
data class FareResponse(val data:Fare?)
