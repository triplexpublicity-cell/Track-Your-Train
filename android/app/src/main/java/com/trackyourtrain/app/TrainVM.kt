package com.trackyourtrain.app

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class TrainVM : ViewModel() {

    private val api: TrackApi = Retrofit.Builder()
        .baseUrl("https://track-your-train-alpha.vercel.app/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(TrackApi::class.java)

    private val _trains = MutableStateFlow<List<BetweenTrain>>(emptyList())
    val trains: StateFlow<List<BetweenTrain>> = _trains

    private val _live = MutableStateFlow<LiveData?>(null)
    val live: StateFlow<LiveData?> = _live

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun searchTrains(
        from: String,
        to: String,
        date: String
    ) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null

            try {
                val response = api.between(
                    from = from,
                    to = to,
                    date = date
                )

                _trains.value = response.data?.trains ?: emptyList()

            } catch (e: Exception) {
                _error.value = e.message ?: "Unable to load trains"
            } finally {
                _loading.value = false
            }
        }
    }

    fun loadLive(
        trainNumber: String,
        date: String
    ) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null

            try {
                val response = api.live(
                    number = trainNumber,
                    date = date
                )

                _live.value = response.data

            } catch (e: Exception) {
                _error.value = e.message ?: "Live data unavailable"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
